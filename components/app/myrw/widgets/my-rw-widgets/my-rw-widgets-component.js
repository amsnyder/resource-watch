import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { Router } from 'routes';

// components
import Icon from 'components/ui/Icon';
import Spinner from 'components/ui/Spinner';
import SearchInput from 'components/ui/SearchInput';
import WidgetList from 'components/widgets/list/WidgetList';
import Paginator from 'components/ui/Paginator';

class MyRWWidgets extends PureComponent {
  static defaultProps = {
    mode: 'grid'
  }

  static propTypes = {
    mode: PropTypes.oneOf(['grid', 'list']),
    orderDirection: PropTypes.oneOf(['asc', 'desc']),
    loading: PropTypes.bool,
    widgets: PropTypes.array,
    pagination: PropTypes.object,
    routes: PropTypes.object,
    setOrderDirection: PropTypes.func,
    setFilters: PropTypes.func,
    setPaginationPage: PropTypes.func
  }

  constructor(props) {
    super(props);

    const { mode } = props;

    this.state = { mode };
  }

  setListMode = () => { this.setState({ mode: 'list' }); }

  setGridMode = () => { this.setState({ mode: 'grid' }); }

  handleNewWidget = () => Router.pushRoute('myrw_detail', { tab: 'widgets', id: 'new' });

  handleSearch = (value) => {
    if (!value.length) {
      this.props.setFilters([]);
    } else {
      this.props.setFilters([{ key: 'name', value }]);
    }
  }

  handleOrderChange = () => {
    const { setOrderDirection } = this.props;
    const orderDirection = this.props.orderDirection === 'asc' ? 'desc' : 'asc';

    setOrderDirection(orderDirection);
  }

  handlePageChange = page => this.props.setPaginationPage(page);

  // TO-DO
  handleWidgetRemoved = () => {}

  // TO-DO
  handleWidgetClick = () => {}

  render() {
    const { mode } = this.state;
    const { widgets, loading, orderDirection, routes, pagination } = this.props;
    const { page, total, limit } = pagination;

    const iconName = classnames({
      'icon-arrow-up': orderDirection === 'asc',
      'icon-arrow-down': orderDirection !== 'asc'
    });

    return (
      <div className="c-myrw-widgets-my">
        <SearchInput
          input={{
            placeholder: 'Search dataset'
          }}
          link={{
            label: 'New widget',
            route: routes.detail,
            params: { tab: 'widgets', id: 'new' }
          }}
          onSearch={this.handleSearch}
        />
        <div className="row">
          <div className="column small-12">
            <div className="list-actions">
              <div className="buttons-container">
                <button
                  className="last-modified-container"
                  onClick={this.handleOrderChange}
                >
                  <a>Last modified</a>
                  <Icon className="-small" name={iconName} />
                </button>
                <div className="mode-buttons">
                  <button
                    className={(mode === 'grid' ? '-active' : '')}
                    onClick={this.setGridMode}
                    title="Grid view"
                  >
                    <Icon name="icon-view-grid" />
                  </button>
                  <button
                    className={(mode === 'list' ? '-active' : '')}
                    onClick={this.setListMode}
                    title="List view"
                  >
                    <Icon name="icon-list-mode" />
                  </button>
                </div>
              </div>
            </div>
            {loading && <Spinner isLoading className="-fixed -light" />}
            {!!(widgets.length) &&
              <WidgetList
                isLoading={loading}
                widgets={widgets}
                mode={mode}
                onWidgetRemove={this.handleWidgetRemoved}
                showActions
                showRemove
                onWidgetClick={this.handleWidgetClick}
              />}
            {!!total && <Paginator
              options={{
                size: total,
                page,
                limit
              }}
              onChange={this.handlePageChange}
            />}
            {!(widgets.length) &&
              <div className="no-widgets-div">
                You currently have no widgets
              </div>}
          </div>
        </div>
      </div>
    );
  }
}

export default MyRWWidgets;
