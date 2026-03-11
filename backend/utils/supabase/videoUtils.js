// Supabase Video Utility Functions

class VideoUtils {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async createVideo(videoData) {
    const { data, error } = await this.supabase
      .from('videos')
      .insert([{
        user_id: videoData.userId,
        original_url: videoData.originalUrl,
        processed_url: videoData.processedUrl,
        title: videoData.title,
        description: videoData.description,
        status: videoData.status || 'processing',
        type: videoData.type,
        result: videoData.result,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getVideosByUserId(userId) {
    const { data, error } = await this.supabase
      .from('videos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateVideo(videoId, updateData) {
    const { data, error } = await this.supabase
      .from('videos')
      .update(updateData)
      .eq('id', videoId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getVideoById(videoId) {
    const { data, error } = await this.supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}

module.exports = VideoUtils;