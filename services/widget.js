import WRISerializer from 'wri-json-api-serializer';

// utils
import { WRIAPI } from 'utils/axios';
import { logger } from 'utils/logs';

/**
 * Fetchs widgets according to params.
 *
 * @param {Object[]} params - params sent to the API.
 * @returns {Object[]} array of serialized widgets.
 */
export const fetchWidgets = (params = {}, headers = {}, _meta = false) => {
  logger.info('fetches widgets');
  return WRIAPI.get('/widget', {
    headers: {
      ...WRIAPI.defaults.headers,
      // TO-DO: forces the API to not cache, this should be removed at some point
      'Upgrade-Insecure-Requests': 1,
      ...headers
    },
    params: {
      env: process.env.API_ENV,
      ...params
    },
    transformResponse: [].concat(
      WRIAPI.defaults.transformResponse,
      (({ data, meta }) => ({ widgets: data, meta }))
    )
  })
    .then((response) => {
      const { status, statusText, data } = response;
      const { widgets, meta } = data;
      if (status >= 300) {
        logger.error('Error fetching widgets:', `${status}: ${statusText}`);
        throw new Error(statusText);
      }

      if (_meta) {
        return {
          widgets: WRISerializer({ data: widgets }),
          meta
        };
      }

      return WRISerializer({ data: widgets });
    })
    .catch((response) => {
      const { status, statusText } = response;

      logger.error(`Error fetching widgets: ${status}: ${statusText}`);
      throw new Error(`Error fetching widgets: ${status}: ${statusText}`);
    });
};


/**
 * fetches data for a specific widget.
 *
 * @param {String} id - widget id.
 * @param {Object[]} params - params sent to the API.
 * @returns {Object} serialized specified widget.
 */
export const fetchWidget = (id, params = {}) => {
  if (!id) throw Error('widget id is mandatory to perform this fetching.');
  logger.info(`Fetches widget: ${id}`);

  return WRIAPI.get(`/widget/${id}`, {
    headers: {
      ...WRIAPI.defaults.headers,
      // TO-DO: forces the API to not cache, this should be removed at some point
      'Upgrade-Insecure-Requests': 1
    },
    params
  })
    .then((response) => {
      const { status, statusText, data } = response;

      if (status >= 300) {
        if (status === 404) {
          logger.debug(`Widget '${id}' not found, ${status}: ${statusText}`);
        } else {
          logger.error(`Error fetching widget: ${id}: ${status}: ${statusText}`);
        }
        throw new Error(statusText);
      }
      return WRISerializer(data);
    })
    .catch(({ response }) => {
      const { status, statusText } = response;

      logger.error(`Error fetching widget ${id}: ${status}: ${statusText}`);
      throw new Error(`Error fetching widget ${id}: ${status}: ${statusText}`);
    });
};

/**
 * Deletes a specified widget.
 * This fetch needs authentication.
 *
 * @param {*} id - widget ID to be deleted.
 * @param {string} token - user's token.
 * @returns {Object} fetch response.
 */
export const deleteWidget = (widgetId, datasetId, token) => {
  logger.info(`deletes widget: ${widgetId}`);

  return WRIAPI.delete(`/dataset/${datasetId}/widget/${widgetId}`, {
    headers: {
      ...WRIAPI.defaults.headers,
      Authorization: token
    }
  })
    .then((response) => {
      const { status, statusText } = response;

      if (status >= 300) {
        if (status === 404) {
          logger.debug(`Widget '${widgetId}' not found, ${status}: ${statusText}`);
        } else {
          logger.error(`Error deleting widget: ${widgetId}: ${status}: ${statusText}`);
        }
        throw new Error(statusText);
      }
      return response;
    })
    .catch(({ response }) => {
      const { status, statusText } = response;

      logger.error(`Error deleting widget ${widgetId}: ${status}: ${statusText}`);
      throw new Error(`Error deleting widget ${widgetId}: ${status}: ${statusText}`);
    });
};

export default {
  fetchWidgets,
  fetchWidget,
  deleteWidget
};
