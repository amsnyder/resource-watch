import WRISerializer from 'wri-json-api-serializer';

// utils
import { WRIAPI } from 'utils/axios';
import { logger } from 'utils/logs';

/**
 * Retrieve all favourites items of the user
 * Check out the API docs for this endpoint {@link https://resource-watch.github.io/doc-api/index-rw.html#get-favorites|here}
 * @param {String} token User's token
 */
export const fetchFavourites = (token) => {
  logger.info('Fetch favourites');
  return WRIAPI.get('favourite',
    {
      headers: {
        Authorization: token,
        'Upgrade-Insecure-Requests': 1
      },
      params: {
        application: process.env.APPLICATIONS,
        env: process.env.API_ENV
      }
    })
    .then(response => WRISerializer(response.data))
    .catch(({ response }) => {
      const { status, statusText } = response;
      logger.error(`Error fetching favourites: ${status}: ${statusText}`);
      throw new Error(`Error fetching favourites: ${status}: ${statusText}`);
    });
};

/**
 * Creates a new favourite item attached to the current user
 * Check out the API docs for this endpoint {@link https://resource-watch.github.io/doc-api/index-rw.html#create-favorite|here}
 * @param {String} token User's token
 * @param {Object} options resourceId - Id of the resource,
 * resourceType - resource's type (can be dataset, layer or widget)
 */
export const createFavourite = (token, { resourceId, resourceType }) => {
  logger.info('Create favourite');
  return WRIAPI.post('favourite',
    {
      application: process.env.APPLICATIONS,
      resourceId,
      resourceType
    },
    { headers: { Authorization: token } })
    .then(response => WRISerializer(response.data))
    .catch(({ response }) => {
      const { status, statusText } = response;
      logger.error(`Error creating favourite: ${status}: ${statusText}`);
      throw new Error(`Error creating favourite: ${status}: ${statusText}`);
    });
};

/**
 * Deletes an existing favourite item attached to the current user
 * Check out the API docs for this endpoint {@link https://resource-watch.github.io/doc-api/index-rw.html#delete-favorite|here}
 * @param {String} token User's token
 * @param {String} resourceId Id of the resource
 */
export const deleteFavourite = (token, resourceId) => {
  logger.info(`Delete favourite ${resourceId}`);
  return WRIAPI.delete(`/favourite/${resourceId}`,
    { headers: { Authorization: token } })
    .then(response => WRISerializer(response.data))
    .catch(({ response }) => {
      const { status, statusText } = response;
      logger.error(`Error deleting favourite ${resourceId} ${status}: ${statusText}`);
      throw new Error(`Error deleting favourite ${resourceId} ${status}: ${statusText}`);
    });
};

export default {
  fetchFavourites,
  deleteFavourite,
  createFavourite
};
