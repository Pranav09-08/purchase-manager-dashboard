// Payment management controller
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// Record Payment
exports.recordPayment = async (req, res) => {
  try {
    const { quotationId, companyId, orderid, amount, phase, payment_type, payment_mode, payment_method, reference_number, payment_proof_url } = req.body;

    if (!amount || !payment_method) {
      return res.status(400).json({
        error: 'Amount and Payment Method are required',
      });
    }

    const { data, error } = await supabase
      .from('Payment')
      .insert([
        {
          paymentId: uuidv4(),
          quotationId: quotationId || null,
          companyId: companyId || null,
          orderid: orderid || null,
          amount: parseFloat(amount),
          phase: phase || null,
          payment_type: payment_type || null,
          payment_mode: payment_mode || null,
          payment_method,
          payment_date: new Date().toISOString(),
          reference_number: reference_number || null,
          status: 'completed',
          payment_proof_url: payment_proof_url || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({ message: 'Payment recorded successfully', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Company Payments
exports.getCompanyPayments = async (req, res) => {
  try {
    const { companyId } = req.params;

    const { data, error } = await supabase
      .from('Payment')
      .select(`
        *,
        Company(company_name, contact_email)
      `)
      .eq('companyId', companyId)
      .order('payment_date', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Payments
exports.getAllPayments = async (req, res) => {
  try {
    const { status, start_date, end_date } = req.query;

    let query = supabase
      .from('Payment')
      .select(`
        *,
        Company(company_name, contact_email)
      `);

    if (status) {
      query = query.eq('status', status);
    }

    if (start_date) {
      query = query.gte('payment_date', start_date);
    }

    if (end_date) {
      query = query.lte('payment_date', end_date);
    }

    const { data, error } = await query.order('payment_date', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Payment Summary
exports.getPaymentSummary = async (req, res) => {
  try {
    const { companyId } = req.query;

    let query = supabase
      .from('Payment')
      .select('amount, payment_date, companyId');

    if (companyId) {
      query = query.eq('companyId', companyId);
    }

    const { data, error } = await query;

    if (error) return res.status(400).json({ error: error.message });

    const totalPayments = data.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

    res.json({
      total_payments: totalPayments,
      payment_count: data.length,
      payments: data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Payment Status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const { data, error } = await supabase
      .from('Payment')
      .update({ status })
      .eq('paymentId', id)
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'Payment status updated', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
