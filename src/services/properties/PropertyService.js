import { supabase } from '../../utils/supabaseClient';

export const PropertyService = {
  async getProperties() {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('property_name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getPropertyById(id) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createProperty(property) {
    const { data, error } = await supabase
      .from('properties')
      .insert([{
        property_name: property.property_name,
        location: property.location,
        contact_number: property.contact_number,
        email: property.email,
        logo_url: property.logo_url,
        timezone: property.timezone || 'Asia/Kolkata',
        currency: property.currency || 'INR',
        status: property.status || 'Active'
      }])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async updateProperty(id, updates) {
    const { data, error } = await supabase
      .from('properties')
      .update({
        property_name: updates.property_name,
        location: updates.location,
        contact_number: updates.contact_number,
        email: updates.email,
        logo_url: updates.logo_url,
        timezone: updates.timezone,
        currency: updates.currency,
        status: updates.status
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async setPropertyStatus(id, isActive) {
    const status = isActive ? 'Active' : 'Inactive';
    return this.updateProperty(id, { status });
  }
};
