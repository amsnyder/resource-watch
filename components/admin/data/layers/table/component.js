import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';

// services
import { fetchLayers } from 'services/LayersService';

// components
import Spinner from 'components/ui/Spinner';
import CustomTable from 'components/ui/customtable/CustomTable';
import SearchInput from 'components/ui/SearchInput';
import NameTD from './td/name';
import OwnerTD from './td/owner';
import UpdatedAtTD from './td/updated-at';
import EditAction from './actions/edit';
import DeleteAction from './actions/delete';
import GoToDatasetAction from './actions/go-to-dataset';

// constants
import { INITIAL_PAGINATION } from './constants';

class LayersTable extends PureComponent {
  static propTypes = {
    dataset: PropTypes.string,
    user: PropTypes.object.isRequired
  }

  static defaultProps = { dataset: null }

  state = {
    pagination: INITIAL_PAGINATION,
    loading: true,
    layers: [],
    filters: { name: null }
  }

  componentDidMount() {
    const { dataset, user: { token } } = this.props;
    const { pagination } = this.state;

    fetchLayers({
      includes: 'user',
      'page[number]': pagination.page,
      'page[size]': pagination.limit,
      application: process.env.APPLICATIONS,
      ...dataset && { dataset }
    }, { Authorization: token }, true)
      .then(({ layers, meta }) => {
        const {
          'total-pages': pages,
          'total-items': size
        } = meta;
        const nextPagination = {
          ...pagination,
          size,
          pages
        };

        this.setState({
          loading: false,
          pagination: nextPagination,
          layers: layers.map(_layer => ({
            ..._layer,
            owner: _layer.user ? _layer.user.name || (_layer.user.email || '').split('@')[0] : ''
          }))
        });
      })
      .catch(({ message }) => { this.setState({ error: message }); });
  }

  /**
   * Event handler executed when the user search for a layer
   * @param {string} { value } Search keywords
   */
  onSearch = debounce((value) => {
    const { dataset, user: { token } } = this.props;
    const { pagination, filters } = this.state;

    if (value.length > 0 && value.length < 3) return;

    this.setState({
      loading: true,
      filters: {
        ...filters,
        name: value
      }
    }, () => {
      const params = {
        includes: 'user',
        ...!value.length && {
          'page[number]': INITIAL_PAGINATION.page,
          'page[size]': INITIAL_PAGINATION.limit,
          application: process.env.APPLICATIONS,
          ...dataset && { dataset }
        },
        ...value.length > 2 && {
          'page[number]': INITIAL_PAGINATION.page,
          'page[size]': INITIAL_PAGINATION.limit,
          application: process.env.APPLICATIONS,
          sort: 'name',
          name: value,
          ...dataset && { dataset }
        }
      };

      fetchLayers(params, { Authorization: token }, true)
        .then(({ layers, meta }) => {
          const {
            'total-pages': pages,
            'total-items': size
          } = meta;
          const nextPagination = {
            ...pagination,
            size,
            pages,
            page: INITIAL_PAGINATION.page
          };

          this.setState({
            loading: false,
            pagination: nextPagination,
            layers: layers.map(_layer => ({
              ..._layer,
              owner: _layer.user ? _layer.user.name || (_layer.user.email || '').split('@')[0] : ''
            }))
          });
        })
        .catch(({ message }) => { this.setState({ error: message }); });
    });
  }, 250)

  onChangePage = (nextPage) => {
    const { dataset, user: { token } } = this.props;
    const { pagination, filters } = this.state;

    this.setState({
      loading: true,
      pagination: {
        ...pagination,
        page: nextPage
      }
    }, () => {
      const { pagination: { page } } = this.state;

      fetchLayers({
        includes: 'user',
        'page[number]': page,
        'page[size]': pagination.limit,
        application: process.env.APPLICATIONS,
        ...filters,
        ...dataset && { dataset }
      }, { Authorization: token })
        .then((layers) => {
          this.setState({
            loading: false,
            layers: layers.map(_layer => ({
              ..._layer,
              owner: _layer.user ? _layer.user.name || (_layer.user.email || '').split('@')[0] : ''
            }))
          });
        })
        .catch(({ message }) => { this.setState({ error: message }); });
    });
  }

  onRemoveLayer = () => {
    const { dataset, user: { token } } = this.props;
    const { pagination, filters } = this.state;

    this.setState({ loading: true });

    fetchLayers({
      includes: 'user',
      'page[number]': pagination.page,
      'page[size]': pagination.limit,
      application: process.env.APPLICATIONS,
      ...filters,
      ...dataset && { dataset }
    }, { Authorization: token }, true)
      .then(({ layers, meta }) => {
        const {
          'total-pages': pages,
          'total-items': size
        } = meta;
        const nextPagination = {
          ...pagination,
          size,
          pages
        };

        this.setState({
          loading: false,
          pagination: nextPagination,
          layers: layers.map(_layer => ({
            ..._layer,
            owner: _layer.user ? _layer.user.name || (_layer.user.email || '').split('@')[0] : ''
          }))
        });
      })
      .catch(({ message }) => { this.setState({ error: message }); });
  }

  render() {
    const {
      loading,
      pagination,
      layers,
      error
    } = this.state;
    const { dataset } = this.props;

    const { dataset } = this.props;

    return (
      <div className="c-layer-table">
        <Spinner
          className="-light"
          isLoading={loading}
        />

        {error && (
          <p>Error: {error}</p>
        )}

        <SearchInput
          input={{ placeholder: 'Search layer' }}
          link={{
            label: 'New layer',
            route: 'admin_data_detail',
            params: {
              tab: 'layers',
              id: 'new',
              dataset
            }
          }}
          onSearch={this.onSearch}
        />

        {!error && (
          <CustomTable
            columns={[
              { label: 'Name', value: 'name', td: NameTD },
              { label: 'Provider', value: 'provider' },
              { label: 'Owner', value: 'owner', td: OwnerTD },
              { label: 'Updated at', value: 'updatedAt', td: UpdatedAtTD }
            ]}
            actions={{
              show: true,
              list: [
                { name: 'Edit', route: 'admin_data_detail', params: { tab: 'layers', subtab: 'edit', id: '{{id}}', dataset }, show: true, component: EditAction },
                { name: 'Remove', route: 'admin_data_detail', params: { tab: 'layers', subtab: 'remove', id: '{{id}}' }, component: DeleteAction },
                { name: 'Go to dataset', route: 'admin_data_detail', params: { tab: 'datasets', subtab: 'edit', id: '{{id}}' }, component: GoToDatasetAction }
              ]
            }}
            sort={{
              field: 'updatedAt',
              value: -1
            }}
            filters={false}
            data={layers}
            onRowDelete={this.onRemoveLayer}
            onChangePage={this.onChangePage}
            pagination={pagination}
          />
        )}
      </div>
    );
  }
}

export default LayersTable;
