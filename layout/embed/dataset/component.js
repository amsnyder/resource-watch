import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'routes';
import { VegaChart, getVegaTheme } from 'widget-editor';

// components
import Spinner from 'components/ui/Spinner';
import LayoutEmbed from 'layout/layout/layout-embed';

// services
import DatasetService from 'services/DatasetService';

// utils
import { isLoadedExternally } from 'utils/embed';

const defaultTheme = getVegaTheme();

class LayoutEmbedDataset extends PureComponent {
  static propTypes = {
    routes: PropTypes.object.isRequired,
    locale: PropTypes.string.isRequired,
    referer: PropTypes.string.isRequired,
    hostname: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);

    const { routes: { query: { id } } } = props;

    this.datasetService = new DatasetService(id, {
      apiURL: process.env.WRI_API_URL,
      language: props.locale
    });
  }

  state = {
    dataset: null,
    loadingWidget: true,
    loadingDataset: true
  }

  componentDidMount() {
    this.datasetService.fetchData('widget, metadata').then((data) => {
      this.setState({
        dataset: data,
        loadingDataset: false
      });
    });
  }

  triggerToggleLoading = () => { this.setState({ loadingWidget: false }); }

  render() {
    const { referer, hostname } = this.props;
    const { dataset, loadingDataset, loadingWidget } = this.state;
    const widgets = dataset && dataset.attributes.widget;
    const metadataObj = dataset && dataset.attributes.metadata[0];
    const datasetName = metadataObj && metadataObj.attributes.info ?
      metadataObj.attributes.info.name : dataset && dataset.attributes.name;
    const datasetDescription = metadataObj && metadataObj.attributes ?
      metadataObj.attributes.description : dataset && dataset.attributes.description;
    const isExternal = isLoadedExternally(referer);
    let widget = null;

    if (widgets) {
      widget = widgets.find(value => value.attributes.default === true);
    }

    if (loadingDataset) {
      return (
        <LayoutEmbed
          title="Loading dataset..."
          description=""
          hostname={hostname}
        >
          <div className="c-embed-widget">
            <Spinner
              isLoading
              className="-light"
            />
          </div>
        </LayoutEmbed>
      );
    }

    return (
      <LayoutEmbed
        title={datasetName}
        description={datasetDescription}
        hostname={hostname}
      >
        <div className="c-embed-dataset">
          {widget &&
            <div className="widget-content">
              <VegaChart
                data={widget.attributes.widgetConfig}
                theme={defaultTheme}
                toggleLoading={this.triggerToggleLoading}
                reloadOnResize
              />
            </div>
          }
          <Spinner isLoading={loadingWidget} className="-light -relative" />
          <div className="info">
            <div className="widget-title">
              <h2>
                <Link
                  route="explore_detail"
                  params={{ id: dataset.id }}
                >
                  <a>{datasetName}</a>
                </Link>
              </h2>
            </div>
            <div className="widget-description">
              {datasetDescription}
            </div>
          </div>
          {isExternal && (
            <div className="widget-footer">
              Powered by
              <a href="/" target="_blank" rel="noopener noreferrer">
                <img
                  className="embed-logo"
                  src="/static/images/logo-embed.png"
                  alt="Resource Watch"
                />
              </a>
            </div>
          ) }
        </div>
      </LayoutEmbed>
    );
  }
}

export default LayoutEmbedDataset;
