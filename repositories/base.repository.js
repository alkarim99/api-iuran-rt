const { ObjectId } = require("mongodb");

class BaseRepository {
  constructor(collection) {
    this.collection = collection;
  }

  async getByID(id) {
    try {
      const data = await this.collection.findOne({ _id: new ObjectId(id) });
      return data;
    } catch (err) {
      console.error("Error retrieving data from MongoDB:", err);
      throw err;
    }
  }

  async create(data) {
    try {
      const result = await this.collection.insertOne(data);
      return result.insertedId;
    } catch (err) {
      console.error("Error creating data:", err);
      throw err;
    }
  }

  async deleteById(id) {
    try {
      const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (err) {
      console.error("Error deleting data:", err);
      throw err;
    }
  }
}

module.exports = BaseRepository;
