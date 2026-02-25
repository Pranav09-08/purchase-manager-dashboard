// Purchase quotation controller
const supabase = require('../config/supabase');

/**
 * Create Purchase Quotation from Enquiry
 * PM sends pricing quotation to vendor based on enquiry
 */
exports.createPurchaseQuotation = async (req, res) => {
  try {
    const { enquiryId, companyId, vendorId, items, validTill, expectedDeliveryDate, advancePaymentPercent, notes } = req.body;
    const purchaseManagerId = req.user?.vendor_id;

    // Validation
    if (!enquiryId || !vendorId || !items || items.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields: enquiryId, vendorId, and items'
      });
    }

    const quotationId = `pq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const quotationNumber = `PQ-${Date.now()}`;

    const advancePercent = Number(advancePaymentPercent) || 0;
    if (advancePercent < 0 || advancePercent > 100) {
      return res.status(400).json({ error: 'Advance payment percent must be between 0 and 100' });
    }

    // Calculate total amount
    let totalAmount = 0;
    const itemInserts = items.map((item) => {
      const discountAmount = (item.lineTotal * (item.discountPercent || 0)) / 100;
      const discountedPrice = item.lineTotal - discountAmount;
      const cgstAmount = (discountedPrice * (item.cgstPercent || 0)) / 100;
      const sgstAmount = (discountedPrice * (item.sgstPercent || 0)) / 100;
      const taxAmount = cgstAmount + sgstAmount;
      const itemTotal = discountedPrice + taxAmount;
      totalAmount += itemTotal;

      return {
        item_id: `pqi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        quotation_id: quotationId,
        component_id: item.componentId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount_percent: item.discountPercent || 0,
        cgst_percent: item.cgstPercent || 0,
        sgst_percent: item.sgstPercent || 0,
        tax_amount: taxAmount,
        line_total: itemTotal,
        created_at: new Date().toISOString(),
      };
    });

    // Create quotation
    const { data: quotation, error: quotationError } = await supabase
      .from('purchase_quotation')
      .insert([
        {
          quotation_id: quotationId,
          enquiry_id: enquiryId,
          vendor_id: vendorId,
          purchase_manager_id: purchaseManagerId,
          quotation_number: quotationNumber,
          quotation_date: new Date().toISOString(),
          valid_till: validTill || null,
          expected_delivery_date: expectedDeliveryDate || null,
          total_amount: totalAmount,
          advance_payment_percent: advancePercent,
          final_payment_percent: 100 - advancePercent,
          status: 'sent',
          notes: notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (quotationError) throw quotationError;

    // Insert items
    const { error: itemsError } = await supabase
      .from('purchase_quotation_items')
      .insert(itemInserts);

    if (itemsError) throw itemsError;

    // Update enquiry status
    const { error: enquiryStatusError } = await supabase
      .from('purchase_enquiry')
      .update({ status: 'quoted', updated_at: new Date().toISOString() })
      .eq('enquiry_id', enquiryId);

    if (enquiryStatusError) {
      throw enquiryStatusError;
    }

    // Fetch complete quotation
    const { data: completeQuotation } = await supabase
      .from('purchase_quotation')
      .select(`
        *,
        items:purchase_quotation_items(*)
      `)
      .eq('quotation_id', quotationId)
      .single();

    res.status(201).json({
      message: 'Purchase quotation created successfully',
      quotation: completeQuotation,
    });
  } catch (error) {
    console.error('Error creating purchase quotation:', error);
    res.status(500).json({ error: error.message || 'Failed to create quotation' });
  }
};

/**
 * Vendor creates quotation from enquiry
 * Vendor responds to PM enquiry with pricing
 */
exports.createVendorQuotation = async (req, res) => {
  try {
    const { enquiryId, items, validTill, expectedDeliveryDate, advancePaymentPercent, notes } = req.body;
    const vendorId = req.user?.vendor_id;

    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor authentication required' });
    }

    if (!enquiryId || !vendorId || !items || items.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields: enquiryId and items'
      });
    }

    const { data: enquiry, error: enquiryError } = await supabase
      .from('purchase_enquiry')
      .select('enquiry_id, vendor_id, status, purchase_manager_id')
      .eq('enquiry_id', enquiryId)
      .limit(1)
      .maybeSingle();

    if (enquiryError) {
      throw enquiryError;
    }

    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    const enquiryVendorId = enquiry.vendor_id;
    const vendorMatchesById = enquiryVendorId && String(enquiryVendorId) === String(vendorId);

    if (!vendorMatchesById) {
      return res.status(403).json({ error: 'Unauthorized to quote this enquiry' });
    }

    const quotationId = `pq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const quotationNumber = `PQ-${Date.now()}`;

    const advancePercent = Number(advancePaymentPercent) || 0;
    if (advancePercent < 0 || advancePercent > 100) {
      return res.status(400).json({ error: 'Advance payment percent must be between 0 and 100' });
    }

    let totalAmount = 0;
    const itemInserts = items.map((item) => {
      const discountAmount = (item.lineTotal * (item.discountPercent || 0)) / 100;
      const discountedPrice = item.lineTotal - discountAmount;
      const cgstAmount = (discountedPrice * (item.cgstPercent || 0)) / 100;
      const sgstAmount = (discountedPrice * (item.sgstPercent || 0)) / 100;
      const taxAmount = cgstAmount + sgstAmount;
      const itemTotal = discountedPrice + taxAmount;
      totalAmount += itemTotal;

      return {
        item_id: `pqi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        quotation_id: quotationId,
        component_id: item.componentId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount_percent: item.discountPercent || 0,
        cgst_percent: item.cgstPercent || 0,
        sgst_percent: item.sgstPercent || 0,
        tax_amount: taxAmount,
        line_total: itemTotal,
        created_at: new Date().toISOString(),
      };
    });

    const { data: quotation, error: quotationError } = await supabase
      .from('purchase_quotation')
      .insert([
        {
          quotation_id: quotationId,
          enquiry_id: enquiryId,
          vendor_id: vendorId,
          purchase_manager_id: null,
          quotation_number: quotationNumber,
          quotation_date: new Date().toISOString(),
          valid_till: validTill || null,
          expected_delivery_date: expectedDeliveryDate || null,
          total_amount: totalAmount,
          advance_payment_percent: advancePercent,
          final_payment_percent: 100 - advancePercent,
          status: 'sent',
          notes: notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (quotationError) throw quotationError;

    const { error: itemsError } = await supabase
      .from('purchase_quotation_items')
      .insert(itemInserts);

    if (itemsError) throw itemsError;

    const { error: vendorEnquiryStatusError } = await supabase
      .from('purchase_enquiry')
      .update({ status: 'quoted', updated_at: new Date().toISOString() })
      .eq('enquiry_id', enquiryId);

    if (vendorEnquiryStatusError) {
      throw vendorEnquiryStatusError;
    }

    const { data: completeQuotation } = await supabase
      .from('purchase_quotation')
      .select(`
        *,
        items:purchase_quotation_items(*)
      `)
      .eq('quotation_id', quotationId)
      .single();

    res.status(201).json({
      message: 'Vendor quotation created successfully',
      quotation: completeQuotation,
    });
  } catch (error) {
    console.error('Error creating vendor quotation:', error);
    res.status(500).json({ error: error.message || 'Failed to create vendor quotation' });
  }
};

/**
 * Get Purchase Quotation by ID
 */
exports.getPurchaseQuotation = async (req, res) => {
  try {
    const { quotationId } = req.params;

    const { data: quotation, error } = await supabase
      .from('purchase_quotation')
      .select(`
        *,
        items:purchase_quotation_items(*)
      `)
      .eq('quotation_id', quotationId)
      .single();

    if (error || !quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    res.json({ quotation });
  } catch (error) {
    console.error('Error fetching purchase quotation:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch quotation' });
  }
};

/**
 * Get all Purchase Quotations
 */
exports.getPurchaseQuotations = async (req, res) => {
  try {
    const { vendorId, status, enquiryId } = req.query;

    let query = supabase
      .from('purchase_quotation')
      .select(`
        *,
        items:purchase_quotation_items(*)
      `);

    if (vendorId) query = query.eq('vendor_id', vendorId);
    if (status) query = query.eq('status', status);
    if (enquiryId) query = query.eq('enquiry_id', enquiryId);

    const { data: quotations, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      quotations: quotations || [],
      total: quotations?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching purchase quotations:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch quotations' });
  }
};

/**
 * Update Purchase Quotation Status
 */
exports.updatePurchaseQuotation = async (req, res) => {
  try {
    const { quotationId } = req.params;
    const { status, notes } = req.body;

    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;

    const { data: quotation, error } = await supabase
      .from('purchase_quotation')
      .update(updateData)
      .eq('quotation_id', quotationId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Quotation updated successfully',
      quotation,
    });
  } catch (error) {
    console.error('Error updating purchase quotation:', error);
    res.status(500).json({ error: error.message || 'Failed to update quotation' });
  }
};
