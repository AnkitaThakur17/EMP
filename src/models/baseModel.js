import logger from "~/utils/logger";

/**
 * Define base model for MongoDB
 */
class BaseModel {

    /**
     * For inserting new properties into a collection.
     * @param {*} insertData 
     * @param {*} Model 
     * @returns 
     */
    async createObj(insertData, Model) {
        try {
            const newObj = new Model(insertData);
            return await newObj.save();
        } catch (error) {
            logger.error("Base model createObj error:", error);
            throw error;
        }
    }

    /**
     * For updating documents in a collection.
     * @param {*} properties 
     * @param {*} query 
     * @param {*} Model 
     * @returns 
     */
    async updateObj(properties, query = {}, Model, options = {}) {
        try {
            // If properties contains any MongoDB operator, use as-is
            const hasOperator = Object.keys(properties).some(key => key.startsWith('$'));
            const update = hasOperator ? properties : { $set: properties };
            const res = await Model.updateOne(query, update, options);
            
            return res;
        } catch (error) {
            logger.error("Base model updateObj error:", error);
            throw error;
        }
    }

    /**
     * Delete documents in a collection.
     * @param {*} query 
     * @param {*} Model 
     * @returns 
     */
    async deleteObj(query = {}, Model) {
        try {
            const res = await Model.deleteOne(query);
            return res;
        } catch (error) {
            logger.error("Base model deleteObj error:", error);
            throw error;
        }
    }

    /**
     * For counting documents in a collection.
     * @param {*} query 
     * @param {*} Model 
     * @returns 
     */
    async getCount(query = {}, Model) {
        try {
            return await Model.countDocuments(query);
        } catch (error) {
            logger.error("Base model getCount error:", error);
            throw error;
        }
    }

    /** 
     * Fetch a single object based on a query.
     * @param {Object} query 
     * @param {Object} Model 
     * @param {Object} [orQuery={}] 
     * @param {Object} [queryNot={}] 
     * @param {String} [sortBy='_id'] 
     * @param {String} [sortDirection='asc'] 
     * @param {String|Object} [selectFields=null] - Fields to select (e.g., "name age" or { name: 1, age: 1 })
     * @returns {Promise<Object>} - The fetched document
     */
    async fetchSingleObj(query = {}, Model, selectFields = null, orQuery = {}, queryNot = {}, sortBy = '_id', sortDirection = 'asc', lean = true) {
        try {
            let mongoQuery = Model.findOne(query);

            if (Object.keys(orQuery).length) {
                mongoQuery.or([orQuery]);
            }

            if (Object.keys(queryNot).length) {
                mongoQuery.nor([queryNot]);
            }

            if (selectFields) {
                mongoQuery.select(selectFields);
            }

            mongoQuery.sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 });
            if (lean) {
                return await mongoQuery.lean();
            }else{
                return await mongoQuery;
            }
        } catch (error) {
            logger.error("Base model fetchSingleObj error:", error);
            throw error;
        }
    }

    /**
     * Fetch all documents from a collection.
     * @param {Object} Model 
     * @param {String} [orderBy='_id'] 
     * @param {String} [order='asc'] 
     * @returns 
     */
    
    async fetchAll(Model, orderBy = '_id', order = 'asc', limit = null, offset = 0, searchQuery = {}, selectedFields = []) {
        try {
           // Define the fields you want to include or exclude in the result
           const fieldsToSelect = selectedFields.length > 0 ? selectedFields.join(' ') : '-__v';
    
           const query = Model.find(searchQuery)
               .sort({ [orderBy]: order === 'asc' ? 1 : -1 })
               .select(fieldsToSelect) // Select specific fields
               .lean();

            if (limit) query.limit(limit);
            if (offset) query.skip(offset);

            return await query.exec();

        } catch (error) {
            logger.error("Base model fetchAll error:", error);
            throw error;
        }
    }

    /**
     * Fetch documents with joins (populate in MongoDB).
     * @param {Object} query 
     * @param {String} populateField 
     * @param {Object} Model 
     * @param {Boolean} [first=true] 
     * @returns 
     */
    async fetchJoinObj(query = {}, populateField, Model, first = true) {
        try {
            let result = Model.find(query).populate(populateField);
            if (first) {
                result = result.limit(1);
            }
            return await result;
        } catch (error) {
            logger.error("Base model fetchJoinObj error:", error);
            throw error;
        }
    }

    /**
     * Fetch documents based on a search query.
     * @param {Object} query 
     * @param {Object} Model 
     * @param {String} [search] 
     * @returns 
     */
    async fetchObj(query = {}, Model, selectFields = null, orQuery = {}, queryNot = {}, offset, limit, sortBy = '_id', sortDirection = 'desc', caseInsensitive = false, lean = true) {
        try {
            let mongoQuery = Model.find(query);

            if (Object.keys(orQuery).length) {
                mongoQuery.or([orQuery]);
            }

            if (Object.keys(queryNot).length) {
                mongoQuery.nor([queryNot]);
            }

            if (selectFields) {
                mongoQuery.select(selectFields);
            }

            if (caseInsensitive && typeof sortBy === 'string') {
                mongoQuery.collation({ locale: 'en', strength: 2 }); // Case-insensitive sort
            }

            mongoQuery.sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 });

            if (limit) {
                mongoQuery.skip(offset).limit(limit);
            }

            if (lean) {
                return await mongoQuery.lean();
            }else{
                return await mongoQuery;
            }
        } catch (error) {
            logger.error("Base model fetchObj error:", error);
            throw error;
        }
    }

    /**
     * Fetch documents with "where in" logic.
     * @param {Object} query 
     * @param {String} whereinkey 
     * @param {Array} wherein 
     * @param {Object} Model 
     * @returns 
     */
    async fetchObjWhereIn(query = {}, whereinkey, wherein = [], Model) {
        try {
            let mongoQuery = Model.find(query);
            if (wherein.length > 0) {
                mongoQuery.where(whereinkey).in(wherein);
            }
            return await mongoQuery;
        } catch (error) {
            logger.error("Base model fetchObjWhereIn error:", error);
            throw error;
        }
    }

    async deleteManyObj(ids = [], Model) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                throw new Error("Invalid input: 'ids' must be a non-empty array.");
            }

            const query = { _id: { $in: ids } };
            const res = await Model.deleteMany(query);
            return res;
        } catch (error) {
            logger.error("Base model deleteManyObj error:", error);
            throw error;
        }
    }

    /**
     * Delete multiple documents in where condition
     * @param {Array} ids - Array of IDs to delete.
     * @param {*} Model - The Mongoose model.
     * @returns 
    */
      async deleteManyObjByQuery(query = {}, Model) {
        try {
            query = query && typeof query === 'object' ? query : {};
            const res = await Model.deleteMany(query);
            return res;
        } catch (error) {
            logger.error("Base model deleteManyObjByQuery error:", error);
            throw error;
        }
    }

}

export default BaseModel;
