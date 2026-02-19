// Quotation management controller
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// Create Quotation/Inquiry
exports.createQuotation = async (req, res) => {
  try {
    const { enquiryId, productId, quantity_quoted, unit_price, valid_until, quotation_amount, pdf_url } = req.body;

    if (!enquiryId || !productId) {
      return res.status(400).json({
        error: 'Enquiry ID and Product ID are required',
      });
    }

    const total_price = quantity_quoted && unit_price ? parseFloat(quantity_quoted) * parseFloat(unit_price) : 0;

    const { data, error } = await supabase
      .from('Quotation')
      .insert([
        {
          quotationId: uuidv4(),
          enquiryId,
          productId,
          quantity_quoted: quantity_quoted ? parseInt(quantity_quoted) : null,
          unit_price: unit_price ? parseFloat(unit_price) : null,
          total_price: total_price || null,
          valid_until: valid_until || null,
          quotation_amount: quotation_amount ? parseFloat(quotation_amount) : null,
          pdf_url: pdf_url || null,
          status: 'sent',
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({ message: 'Quotation sent successfully', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Quotations for Enquiry
exports.getEnquiryQuotations = async (req, res) => {
  try {
    const { enquiryId } = req.params;

    const { data, error } = await supabase
      .from('Quotation')
      .select(`
        *,
        Products(title, Item_no),
        Enquiries(title, description)
      `)
      .eq('enquiryId', enquiryId)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Quotations
exports.getAllQuotations = async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('Quotation')
      .select(`
        *,
        Products(title, Item_no)
      `);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Quotation Status
exports.updateQuotationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const { data, error } = await supabase
      .from('Quotation')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('quotationId', id)
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'Quotation status updated', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Expired Quotations
exports.getExpiredQuotations = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('Quotation')
      .select(`
        *,
        Products(title)
      `)
      .lt('valid_until', today)
      .eq('status', 'sent');

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
