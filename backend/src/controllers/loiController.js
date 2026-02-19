// LOI management controller
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// Create/Submit LOI (Letter of Intent)
exports.createLOI = async (req, res) => {
  try {
    const { quotationId, companyId, loi_number, description, attachment_url, file_type } = req.body;

    if (!quotationId || !loi_number) {
      return res.status(400).json({ error: 'Quotation ID and LOI number are required' });
    }

    const { data, error } = await supabase
      .from('LOI')
      .insert([
        {
          loiId: uuidv4(),
          quotationId,
          companyId: companyId || null,
          loi_number,
          description: description || null,
          submitted_date: new Date().toISOString(),
          status: 'received',
          attachment_url: attachment_url || null,
          file_type: file_type || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({ message: 'LOI submitted successfully', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Company LOIs
exports.getCompanyLOIs = async (req, res) => {
  try {
    const { companyId } = req.params;

    const { data, error } = await supabase
      .from('LOI')
      .select(`
        *,
        Company(company_name, contact_email)
      `)
      .eq('companyId', companyId)
      .order('submitted_date', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All LOIs
exports.getAllLOIs = async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('LOI')
      .select(`
        *,
        Company(company_name, contact_email)
      `);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('submitted_date', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Single LOI
exports.getLOI = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('LOI')
      .select(`
        *,
        Company(company_name, contact_email)
      `)
      .eq('loiId', id)
      .single();

    if (error) return res.status(404).json({ error: 'LOI not found' });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update LOI Status
exports.updateLOIStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const { data, error } = await supabase
      .from('LOI')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('loiId', id)
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'LOI status updated', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
