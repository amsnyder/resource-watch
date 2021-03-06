import 'isomorphic-fetch';

import sortBy from 'lodash/sortBy';
import { Deserializer } from 'jsonapi-serializer';

export default class FaqsService {
  constructor(options = {}) {
    this.opts = options;
  }

  // GET ALL DATA
  fetchAllData() {
    return fetch(
      `${process.env.WRI_API_URL}/faq/?published=all&env=${process.env.API_ENV}&application=${process.env.APPLICATIONS}`,
      { headers: { 'Upgrade-Insecure-Requests': 1 } }

    )
      .then((response) => {
        const { status, statusText } = response;
        if (response.ok) return response.json();

        const errorObject = {
          errors: {
            status,
            details: statusText
          }
        };
        throw errorObject;
      })
      .then(response => new Deserializer({
        keyForAttribute: 'underscore_case'
      }).deserialize(response, (err, faqs) => sortBy(faqs, 'order')));
  }

  fetchData(id) {
    return fetch(
      `${process.env.WRI_API_URL}/faq/${id}`,
      { headers: { 'Upgrade-Insecure-Requests': 1 } }

    )
      .then((response) => {
        const { status, statusText } = response;
        if (response.ok) return response.json();

        const errorObject = {
          errors: {
            status,
            details: statusText
          }
        };
        throw errorObject;
      })
      .then(response => new Deserializer({
        keyForAttribute: 'underscore_case'
      }).deserialize(response, (err, faq) => faq));
  }

  saveData({ type, body, id = '' }) {
    return fetch(`${process.env.WRI_API_URL}/faq/${id}`, {
      method: type,
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'Upgrade-Insecure-Requests': 1,
        Authorization: this.opts.authorization
      }
    })
      .then((response) => {
        const { status, statusText } = response;
        if (response.ok) return response.json();

        const errorObject = {
          errors: {
            status,
            details: statusText
          }
        };
        throw errorObject;
      })
      .then(response => new Deserializer({
        keyForAttribute: 'underscore_case'
      }).deserialize(response, (err, faq) => faq));
  }

  deleteData(id) {
    return fetch(`${process.env.WRI_API_URL}/faq/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.opts.authorization
      }
    })
      .then((response) => {
        const { status, statusText } = response;
        if (response.ok) return response;

        const errorObject = {
          errors: {
            status,
            details: statusText
          }
        };
        throw errorObject;
      });
  }

  updateFaqOrder(order, token) {
    return fetch(`${process.env.WRI_API_URL}/faq/reorder`, {
      method: 'POST',
      body: JSON.stringify(order),
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    })
      .then((response) => {
        const { status, statusText } = response;
        if (response.ok) return response.json();

        const errorObject = {
          errors: {
            status,
            details: statusText
          }
        };
        throw errorObject;
      })
      .then(response => new Deserializer({
        keyForAttribute: 'underscore_case'
      }).deserialize(response, (err, faqs) => sortBy(faqs, 'order')));
  }
}
