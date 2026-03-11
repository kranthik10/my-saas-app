// Supabase User Utility Functions

class UserUtils {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async getUserById(userId) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getUserByEmail(email) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Record not found
        return null;
      }
      throw new Error(error.message);
    }

    return data;
  }

  async createUser(user) {
    const { data, error } = await this.supabase
      .from('users')
      .insert([{
        name: user.name,
        email: user.email,
        subscription: user.subscription || 'free',
        credits: user.credits || 10,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateUser(userId, updateData) {
    const { data, error } = await this.supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async deductCredit(userId) {
    const { data, error } = await this.supabase.rpc('deduct_credit', {
      user_id: userId
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}

module.exports = UserUtils;