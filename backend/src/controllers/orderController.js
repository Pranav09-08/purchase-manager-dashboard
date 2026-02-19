// Order management controller
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// Create Order/Approval
exports.createOrder = async (req, res) => {
  try {
    const { companyId, quotationId, loiId, approval_choice } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const { data, error } = await supabase
      .from('Orders')
      .insert([
        {
          orderId: uuidv4(),
          companyId,
          quotationId: quotationId || null,
          loiId: loiId || null,
          order_date: new Date().toISOString(),
          status: 'pending',
          approval_choice: approval_choice || null,
        },
      ])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({ message: 'Order created successfully', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Accept Order
exports.acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { approval_choice } = req.body;

    const { data, error } = await supabase
      .from('Orders')
      .update({
        status: 'approved',
        approval_choice: approval_choice || 'accepted',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('orderId', id)
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'Order accepted successfully', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject Order
exports.rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { approval_choice } = req.body;

    const { data, error } = await supabase
      .from('Orders')
      .update({
        status: 'rejected',
        approval_choice: approval_choice || 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('orderId', id)
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'Order rejected successfully', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Company Orders
exports.getCompanyOrders = async (req, res) => {
  try {
    const { companyId } = req.params;

    const { data, error } = await supabase
      .from('Orders')
      .select(`
        *,
        Quotation(productId, total_price),
        LOI(loi_number),
        invoice:vendor_invoice(invoice_id, invoice_number, status, total_amount)
      `)
      .eq('companyId', companyId)
      .order('order_date', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Orders
exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('Orders')
      .select(`
        *,
        Company(company_name, contact_email),
        Quotation(productId, total_price),
        LOI(loi_number)
      `);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('order_date', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Pending Orders
exports.getPendingOrders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Orders')
      .select(`
        *,
        Company(company_name, contact_email),
        Quotation(productId, total_price),
        LOI(loi_number)
      `)
      .eq('status', 'pending')
      .order('order_date', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send Choice/Options to Company
exports.sendChoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { choice_options } = req.body;

    if (!choice_options) {
      return res.status(400).json({ error: 'Choice options are required' });
    }

    const { data, error } = await supabase
      .from('Orders')
      .update({
        approval_choice: JSON.stringify(choice_options),
        updated_at: new Date().toISOString(),
      })
      .eq('orderId', id)
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'Choice options sent successfully', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
