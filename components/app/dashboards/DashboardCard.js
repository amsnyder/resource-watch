import React from 'react';
import PropTypes from 'prop-types';
import 'isomorphic-fetch';

// Components
import Title from 'components/ui/Title';
import TextChart from 'components/widgets/TextChart';
import VegaChart from 'components/widgets/VegaChart';
import Map from 'components/vis/Map';
import Legend from 'components/ui/Legend';
import Spinner from 'components/ui/Spinner';

// Redux
import withRedux from 'next-redux-wrapper';
import { initStore } from 'store';
import { toggleModal, setModalOptions } from 'redactions/modal';

// Utils
import getChartTheme from 'utils/widgets/theme';
import LayerManager from 'utils/layers/LayerManager';

class DashboardCard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null, // Error message
      loading: false,
      name: null, // Name of the widget
      widgetConfig: null, // Vega config of the widget
      layer: null // Map's layer
    };
  }

  componentDidMount() {
    if (this.props.widgetId) {
      this.getData();
    }
  }

  /**
   * Fetch the widget's data and set a few properties in the
   * state once done
   */
  getData() {
    this.setState({ loading: true });

    fetch(`${process.env.WRI_API_URL}/widget/${this.props.widgetId}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error(res.statusText);
      })
      .then(({ data }) => {
        this.setState({
          name: data.attributes.name,
          widgetConfig: data.attributes.widgetConfig
        }, () => {
          // If the widget is a map, we also fetch its layer
          if (data.attributes.widgetConfig.type && data.attributes.widgetConfig.type === 'map') {
            this.getLayer();
          }
        });
      })
      .catch(err => this.setState({ error: err.message }));
      // TODO error message
  }

  /**
   * Fetch the map's layer if the widget is a map and store it
   * in the state
   * NOTE: you should only call this method if you're sure the
   * widget is a map and its config has been loaded
   */
  getLayer() {
    // At this point, loading is still true
    const widgetConfig = this.getWidgetConfig();

    fetch(`${process.env.WRI_API_URL}/layer/${widgetConfig.layer_id}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error(res.statusText);
      })
      .then(({ data }) => {
        this.setState({
          layer: {
            id: data.id,
            name: data.attributes.name,
            subtitle: data.attributes.subtitle,
            ...data.attributes,
            order: 1,
            hidden: false
          }
        });
      })
      .catch(err => this.setState({ error: err.message }))
      // We remove the loader because the map will render
      // right away
      .then(() => this.setState({ loading: false }));
  }

  /**
   * Return the widget config
   * @returns {object}
   */
  getWidgetConfig() {
    return (this.props.data && this.props.data.attributes.widgetConfig)
      || this.state.widgetConfig;
  }

  /**
   * Return the type of widget
   * @returns {'vega'|'map'|'text'}
   */
  getWidgetType() {
    const widgetConfig = this.getWidgetConfig();
    return (widgetConfig && widgetConfig.type) || 'vega';
  }

  render() {
    const widgetConfig = this.getWidgetConfig();

    // Type of the widget: "vega", "text" or "map"
    const widgetType = (widgetConfig && widgetConfig.type) || 'vega';

    return (
      <div className="c-dashboard-card">
        <header>
          <Title className="-default">{this.state.name || this.props.name || '–'}</Title>
          <ul className="categories">
            {this.props.categories.map(category => <li key={category}>{category}</li>)}
          </ul>
        </header>
        <div className="widget-container">
          <Spinner isLoading={this.state.loading} className="-light -small" />
          { widgetType === 'text'
            && <TextChart
              widgetConfig={widgetConfig}
              toggleLoading={loading => this.setState({ loading })}
            />
          }
          { widgetConfig && widgetType === 'vega'
            && <VegaChart
              data={widgetConfig}
              theme={getChartTheme()}
              toggleLoading={loading => this.setState({ loading })}
            />
          }
          {
            widgetConfig && widgetType === 'map' && this.state.layer
              && (
                <div>
                  <Map
                    LayerManager={LayerManager}
                    mapConfig={{}}
                    layersActive={[this.state.layer]}
                  />
                  <Legend
                    layersActive={[this.state.layer]}
                    className={{ color: '-dark' }}
                    toggleModal={this.props.toggleModal}
                    setModalOptions={this.props.setModalOptions}
                    expanded={false}
                    readonly
                  />
                </div>
              )
          }
          { !this.props.data && !this.props.widgetId
            && <div className="no-data"><span>No data</span></div>
          }
        </div>
      </div>
    );
  }

}

DashboardCard.propTypes = {
  widgetId: PropTypes.string,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  // Redux
  toggleModal: PropTypes.func.isRequired,
  setModalOptions: PropTypes.func.isRequired,
  // NOTE:
  // The following props will be deprecated once the dashboards
  // have all of their widgets in the API
  name: PropTypes.string,
  data: PropTypes.object // Raw data from the server: { data: { attributes: { ... } } }
};

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
  toggleModal: open => dispatch(toggleModal(open)),
  setModalOptions: options => dispatch(setModalOptions(options))
});

export default withRedux(initStore, mapStateToProps, mapDispatchToProps)(DashboardCard);
