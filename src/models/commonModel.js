import tableConstants from '~/constants/tableConstants';
import commonConstants from '~/constants/commonConstants';

/**
 * Define common model for MongoDB
 */
class CommonModel {

    //Get user list according to type
    async getUserList(Model, userType, where = {}, limit, offset) {
        try {
            const BASE_URL = process.env.ASSETS_URL_BASE;
            const defaultProfileImg = `${process.env.ASSETS_URL_BASE}${commonConstants.DEFAULT_USER_IMAGE}`;
            
            // Initialize dynamic fields and lookups
            let projectFields = {
                // _id: 1,
                email: 1,
                phoneDialCode: 1,
                phoneNumber: 1,
                profileImage: {
                    $cond: {
                        if: { $or: [{ $eq: ["$profileImage", null] }, { $not: ["$profileImage"] }] },
                        then: defaultProfileImg,
                        else: { $concat: [`${BASE_URL}${commonConstants.UPLOAD_PATH}${commonConstants.PROFILE_UPLOAD_PATH}/`, "$profileImage"] }
                    }
                }
            };
    
            let lookupStages = [];
            // For store type
            if (userType === commonConstants.USER_TYPE.STORE) {
                projectFields.bussinessName = 1;
                projectFields.storeType = 1;
                projectFields.rating = 1;
    
                lookupStages.push(
                    {
                        $lookup: {
                            from: tableConstants.STORETYPE,
                            localField: 'storeType',
                            foreignField: '_id',
                            as: 'storeTypeDetails'
                        }
                    },
                    {
                        $lookup: {
                            from: tableConstants.REVIEWRATING,
                            localField: '_id',
                            foreignField: 'storeId',
                            as: 'ratingDetails'
                        }
                    },
                    {
                        $addFields: {
                            storeType: { $arrayElemAt: ['$storeTypeDetails.storeType', 0] },
                            rating: {
                                $cond: {
                                    if: { $gt: [{ $size: '$ratingDetails' }, 0] },
                                    then: { $avg: '$ratingDetails.rating' },
                                    else: 0 // Set to null if no ratings
                                }
                            }
                        }
                    }
                );
            }
    
            // Combine the base pipeline with the dynamic stages
           const pipeline = [
            { $match: where },
            ...lookupStages,
            {
                $project: {
                    // Dynamically add the correct ID field based on userType at the top
                    _id: 0, // Exclude the original _id
                    storeId: { $cond: [{ $eq: [userType, commonConstants.USER_TYPE.STORE] }, "$_id", "$$REMOVE"] },
                    customerId: { $cond: [{ $eq: [userType, commonConstants.USER_TYPE.CUSTOMER] }, "$_id", "$$REMOVE"] },
                    driverId: { $cond: [{ $eq: [userType, commonConstants.USER_TYPE.DRIVER] }, "$_id", "$$REMOVE"] },
                    ...projectFields, // Add other fields below
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: offset },
            { $limit: limit },
        ];
            
            const users = await Model.aggregate(pipeline).exec();
            return users;
    
        } catch (error) {
            this.logger.error(error);
            throw error; // Propagate the error for proper handling
        }
    }
}    

export default CommonModel;
