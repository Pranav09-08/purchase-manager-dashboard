// Purchase LOI controller
const supabase = require('../config/supabase');

/**
 * Create Purchase LOI (Letter of Intent)
 * PM sends LOI to vendor after quotation approval
 */
exports.createPurchaseLOI = async (req, res) => {
  try {
    const { quotationId, counterQuotationId, totalAmount, advancePaymentPercent, expectedDeliveryDate, termsAndConditions } = req.body;
    const purchaseManagerId = req.user?.vendor_id;

    // Validation
    if (!quotationId || !totalAmount) {
      return res.status(400).json({
        error: 'Missing required fields: quotationId, totalAmount'
      });
    }

    const { data: quotation, error: quotationError } = await supabase
      .from('purchase_quotation')
      .select('*')
      .eq('quotation_id', quotationId)
      .single();

    if (quotationError || !quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    const vendorId = quotation.vendor_id;

    const loiId = `pl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const loiNumber = `LOI-${Date.now()}`;

    // Create LOI
    const { data: loi, error } = await supabase
      .from('purchase_loi')
      .insert([
        {
          loi_id: loiId,
          quotation_id: quotationId,
          counter_quotation_id: counterQuotationId || null,
          vendor_id: vendorId,
          purchase_manager_id: purchaseManagerId,
          loi_number: loiNumber,
          loi_date: new Date().toISOString(),
          total_amount: totalAmount,
          advance_payment_percent: advancePaymentPercent || 0,
          final_payment_percent: 100 - (advancePaymentPercent || 0),
          expected_delivery_date: expectedDeliveryDate || null,
          terms_and_conditions: termsAndConditions || null,
          status: 'sent',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Update quotation status
    await supabase
      .from('purchase_quotation')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('quotation_id', quotationId);

    res.status(201).json({
      message: 'Purchase LOI created successfully',
      loi,
    });
  } catch (error) {
    console.error('Error creating purchase LOI:', error);
    res.status(500).json({ error: error.message || 'Failed to create LOI' });
  }
};

/**
 * Get Purchase LOI by ID
 */
exports.getPurchaseLOI = async (req, res) => {
  try {
    const { loiId } = req.params;

    const { data: loi, error } = await supabase
      .from('purchase_loi')
      .select('*')
      .eq('loi_id', loiId)
      .single();

    if (error || !loi) {
      return res.status(404).json({ error: 'LOI not found' });
    }

    res.json({ loi });
  } catch (error) {
    console.error('Error fetching purchase LOI:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch LOI' });
  }
};

/**
 * Get all Purchase LOIs
 */
exports.getPurchaseLOIs = async (req, res) => {
  try {
    const { vendorId, status, quotationId } = req.query;

    let query = supabase
      .from('purchase_loi')
      .select('*');

    if (vendorId) query = query.eq('vendor_id', vendorId);
    if (status) query = query.eq('status', status);
    if (quotationId) query = query.eq('quotation_id', quotationId);

    const { data: lois, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      lois: lois || [],
      total: lois?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching purchase LOIs:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch LOIs' });
  }
};

/**
 * Vendor Accepts LOI
 */
exports.acceptLOI = async (req, res) => {
  try {
    const { loiId } = req.params;
    const vendorId = req.user?.vendor_id;

    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor authentication required' });
    }

    const { data: loi, error: fetchError } = await supabase
      .from('purchase_loi')
      .select('*')
      .eq('loi_id', loiId)
      .single();

    if (fetchError || !loi) {
      return res.status(404).json({ error: 'LOI not found' });
    }

    // Verify vendor
    if (String(loi.vendor_id) !== String(vendorId)) {
      return res.status(403).json({ error: 'Unauthorized to accept this LOI' });
    }

    const { data: updated, error } = await supabase
      .from('purchase_loi')
      .update({
        status: 'accepted',
        vendor_response_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('loi_id', loiId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'LOI accepted successfully',
      loi: updated,
    });
  } catch (error) {
    console.error('Error accepting LOI:', error);
    res.status(500).json({ error: error.message || 'Failed to accept LOI' });
  }
};

/**
 * Vendor Rejects LOI
 */
exports.rejectLOI = async (req, res) => {
  try {
    const { loiId } = req.params;
    const vendorId = req.user?.vendor_id;

    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor authentication required' });
    }

    const { data: loi, error: fetchError } = await supabase
      .from('purchase_loi')
      .select('*')
      .eq('loi_id', loiId)
      .single();

    if (fetchError || !loi) {
      return res.status(404).json({ error: 'LOI not found' });
    }

    // Verify vendor
    if (String(loi.vendor_id) !== String(vendorId)) {
      return res.status(403).json({ error: 'Unauthorized to reject this LOI' });
    }

    const { data: updated, error } = await supabase
      .from('purchase_loi')
      .update({
        status: 'rejected',
        vendor_response_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('loi_id', loiId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'LOI rejected',
      loi: updated,
    });
  } catch (error) {
    console.error('Error rejecting LOI:', error);
    res.status(500).json({ error: error.message || 'Failed to reject LOI' });
  }
};

/**
 * Update LOI
 */
exports.updatePurchaseLOI = async (req, res) => {
  try {
    const { loiId } = req.params;
    const { status, termsAndConditions, expectedDeliveryDate, totalAmount, advancePaymentPercent } = req.body;

    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (status) updateData.status = status;
    if (termsAndConditions !== undefined) updateData.terms_and_conditions = termsAndConditions;
    if (expectedDeliveryDate !== undefined) updateData.expected_delivery_date = expectedDeliveryDate;
    if (totalAmount !== undefined) updateData.total_amount = totalAmount;
    if (advancePaymentPercent !== undefined) {
      const advancePercent = Number(advancePaymentPercent) || 0;
      updateData.advance_payment_percent = advancePercent;
      updateData.final_payment_percent = 100 - advancePercent;
    }
    if (status === 'sent') {
      updateData.vendor_response_date = null;
    }

    const { data: loi, error } = await supabase
      .from('purchase_loi')
      .update(updateData)
      .eq('loi_id', loiId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'LOI updated successfully',
      loi,
    });
  } catch (error) {
    console.error('Error updating purchase LOI:', error);
    res.status(500).json({ error: error.message || 'Failed to update LOI' });
  }
};
