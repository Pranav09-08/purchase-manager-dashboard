// CRUD for purchase manager required components
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// Create required component (purchase manager)
exports.createRequiredComponent = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Component name is required' });
    }

    const { data, error } = await supabase
      .from('purchase_required_components')
      .insert([
        {
          id: uuidv4(),
          name,
          description: description || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({ message: 'Component added successfully', component: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all required components (vendors + purchase manager)
exports.getRequiredComponents = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('purchase_required_components')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ components: data || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update required component
exports.updateRequiredComponent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Component name is required' });
    }

    const { data, error } = await supabase
      .from('purchase_required_components')
      .update({
        name,
        description: description || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'Component updated successfully', component: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete required component
exports.deleteRequiredComponent = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('purchase_required_components')
      .delete()
      .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'Component deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
