// Vendor counter-quotation controller
const supabase = require('../config/supabase');

/**
 * Vendor Counter Quotation
 * Vendor can negotiate, accept, or reject quotation
 */
exports.createCounterQuotation = async (req, res) => {
  try {
    const { quotationId, action, expectedDeliveryDate, items, validTill, advancePaymentPercent, rejectionReason, negotiationNotes } = req.body;
    const vendorId = req.user?.vendor_id;

    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor authentication required' });
    }

    // Validation
    if (!quotationId || !action) {
      return res.status(400).json({
        error: 'Missing required fields: quotationId, action'
      });
    }

    if (!['accept', 'reject', 'negotiate'].includes(action)) {
      return res.status(400).json({
        error: 'Action must be: accept, reject, or negotiate'
      });
    }

    // Get original quotation
    const { data: originalQuotation, error: fetchError } = await supabase
      .from('purchase_quotation')
      .select('*')
      .eq('quotation_id', quotationId)
      .single();

    if (fetchError || !originalQuotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    const counterId = `vcq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const counterNumber = `VC-${Date.now()}`;

    let totalAmount = originalQuotation.total_amount;
    let itemInserts = [];

    // If negotiating, calculate new amount from items
    if (action === 'negotiate' && items && items.length > 0) {
      totalAmount = 0;
      itemInserts = items.map((item) => {
        const cgstAmount = (item.lineTotal * (item.cgstPercent || 0)) / 100;
        const sgstAmount = (item.lineTotal * (item.sgstPercent || 0)) / 100;
        const taxAmount = cgstAmount + sgstAmount;
        const itemTotal = item.lineTotal + taxAmount;
        totalAmount += itemTotal;

        return {
          item_id: `vcqi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          counter_id: counterId,
          component_id: item.componentId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount_percent: item.discountPercent || 0,
          cgst_percent: item.cgstPercent || 0,
          sgst_percent: item.sgstPercent || 0,
          tax_amount: taxAmount,
          line_total: itemTotal,
          notes: item.notes || null,
          created_at: new Date().toISOString(),
        };
      });
    }

    // Create counter quotation
    const counterStatus = action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'pending';
    const counterData = {
      counter_id: counterId,
      quotation_id: quotationId,
      vendor_id: vendorId,
      counter_number: counterNumber,
      action,
      counter_date: new Date().toISOString(),
      valid_till: validTill || null,
      expected_delivery_date: expectedDeliveryDate || null,
      total_amount: totalAmount,
      advance_payment_percent: advancePaymentPercent || originalQuotation.advance_payment_percent,
      final_payment_percent: 100 - (advancePaymentPercent || originalQuotation.advance_payment_percent),
      rejection_reason: action === 'reject' ? rejectionReason : null,
      negotiation_notes: action === 'negotiate' ? negotiationNotes : null,
      status: counterStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: counter, error: counterError } = await supabase
      .from('vendor_counter_quotation')
      .insert([counterData])
      .select()
      .single();

    if (counterError) throw counterError;

    // Insert counter items if negotiating
    if (itemInserts.length > 0) {
      const { error: itemsError } = await supabase
        .from('vendor_counter_quotation_items')
        .insert(itemInserts);

      if (itemsError) throw itemsError;
    }

    // Update quotation status
    const newQuotationStatus = action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'negotiating';
    await supabase
      .from('purchase_quotation')
      .update({ status: newQuotationStatus, updated_at: new Date().toISOString() })
      .eq('quotation_id', quotationId);

    // Fetch complete counter quotation
    const { data: completeCounter } = await supabase
      .from('vendor_counter_quotation')
      .select(`
        *,
        items:vendor_counter_quotation_items(*)
      `)
      .eq('counter_id', counterId)
      .single();

    res.status(201).json({
      message: `Quotation ${action}ed successfully`,
      counter: completeCounter,
    });
  } catch (error) {
    console.error('Error creating counter quotation:', error);
    res.status(500).json({ error: error.message || 'Failed to create counter quotation' });
  }
};

/**
 * Get Counter Quotation by ID
 */
exports.getCounterQuotation = async (req, res) => {
  try {
    const { counterId } = req.params;

    const { data: counter, error } = await supabase
      .from('vendor_counter_quotation')
      .select(`
        *,
        items:vendor_counter_quotation_items(*)
      `)
      .eq('counter_id', counterId)
      .single();

    if (error || !counter) {
      return res.status(404).json({ error: 'Counter quotation not found' });
    }

    res.json({ counter });
  } catch (error) {
    console.error('Error fetching counter quotation:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch counter quotation' });
  }
};

/**
 * Get all Counter Quotations for a Quotation
 */
exports.getCounterQuotations = async (req, res) => {
  try {
    const { quotationId, vendorId, status } = req.query;

    let query = supabase
      .from('vendor_counter_quotation')
      .select(`
        *,
        items:vendor_counter_quotation_items(*)
      `);

    if (quotationId) query = query.eq('quotation_id', quotationId);
    if (vendorId) query = query.eq('vendor_id', vendorId);
    if (status) query = query.eq('status', status);

    const { data: counters, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      counters: counters || [],
      total: counters?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching counter quotations:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch counter quotations' });
  }
};

/**
 * PM Accepts Counter Quotation
 */
exports.acceptCounterQuotation = async (req, res) => {
  try {
    const { counterId } = req.params;

    const { data: counter, error: fetchError } = await supabase
      .from('vendor_counter_quotation')
      .select('*')
      .eq('counter_id', counterId)
      .single();

    if (fetchError || !counter) {
      return res.status(404).json({ error: 'Counter quotation not found' });
    }

    const { data: updated, error } = await supabase
      .from('vendor_counter_quotation')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('counter_id', counterId)
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('purchase_quotation')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('quotation_id', counter.quotation_id);

    res.json({
      message: 'Counter quotation accepted',
      counter: updated,
    });
  } catch (error) {
    console.error('Error accepting counter quotation:', error);
    res.status(500).json({ error: error.message || 'Failed to accept counter quotation' });
  }
};

/**
 * PM Rejects Counter Quotation
 */
exports.rejectCounterQuotation = async (req, res) => {
  try {
    const { counterId } = req.params;

    const { data: counter, error: fetchError } = await supabase
      .from('vendor_counter_quotation')
      .select('*')
      .eq('counter_id', counterId)
      .single();

    if (fetchError || !counter) {
      return res.status(404).json({ error: 'Counter quotation not found' });
    }

    const { data: updated, error } = await supabase
      .from('vendor_counter_quotation')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('counter_id', counterId)
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('purchase_quotation')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('quotation_id', counter.quotation_id);

    res.json({
      message: 'Counter quotation rejected',
      counter: updated,
    });
  } catch (error) {
    console.error('Error rejecting counter quotation:', error);
    res.status(500).json({ error: error.message || 'Failed to reject counter quotation' });
  }
};
