import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import HeadNext from 'next/head';

// constants
import { CESIUM_ROUTES } from 'constants/app';

class HeadApp extends PureComponent {
  static propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    thumbnail: PropTypes.string,
    routes: PropTypes.object.isRequired,
    hostname: PropTypes.string.isRequired
  };

  static defaultProps = {
    title: null,
    description: null,
    thumbnail: 'https://resourcewatch.org/static/images/social-big.jpg'
  }

  getCrazyEgg() {
    if (process.env.RW_NODE_ENV === 'production' && typeof window !== 'undefined') {
      return (
        <script
          type="text/javascript"
          src="//script.crazyegg.com/pages/scripts/0069/4623.js"
          async="async"
        />
      );
    }
    return null;
  }

  getUserReport() {
    if (process.env.RW_NODE_ENV === 'production' && typeof window !== 'undefined') {
      return (
        <script
          type="text/javascript"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
              window._urq = window._urq || [];
              _urq.push(['setGACode', '${process.env.GOOGLE_ANALYTICS}']);
              _urq.push(['initSite', '085d5a65-977b-4c3d-af9f-d0a3624e276f']);
              (function() {
              var ur = document.createElement('script');
              ur.type = 'text/javascript';
              ur.async = true;
              ur.src = ('https:' == document.location.protocol ? 'https://cdn.userreport.com/userreport.js' : 'http://cdn.userreport.com/userreport.js');
              var s = document.getElementsByTagName('script')[0];
              s.parentNode.insertBefore(ur, s);
              })();
            `
          }}
        />
      );
    }

    return null;
  }

  getCesium() {
    const { routes: { pathname } } = this.props;

    if (CESIUM_ROUTES.includes(pathname)) {
      return (
        <Fragment>
          <script src="/static/cesium/cesium.js" />
          <script src="/static/cesium/cesium-navigation.js" />
          <link rel="stylesheet" href="/static/cesium/navigation.css" />
          <link rel="stylesheet" href="/static/cesium/Widgets/widgets.css" />
        </Fragment>
      );
    }

    return null;
  }

  render() {
    const {
      title,
      description,
      thumbnail,
      hostname
    } = this.props;
    return (
      <HeadNext>
        <title>{title ? `${title} | Resource Watch` : 'Resource Watch'}</title>

        <meta property="og:url" content={hostname} />
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta name="og:image" content={thumbnail} />
        <meta property="og:image:secure_url" content={thumbnail} />
        <meta name="og:image:alt" content={`${title}_widget`} />

        {/* leaflet styles */}
        {/* Leaflet styles are here to allow our chunk css (custom styles) override them */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.3.4/dist/leaflet.css"
          integrity="sha512-puBpdR0798OZvTTbP4A8Ix/l+A4dHDD0DGqYW6RQ+9jxkRFclaxxQb/SJAWZfWAkuyeQUytO7+7N4QKrDh+drA=="
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.2/leaflet.draw.css"
          crossOrigin=""
        />

        {this.getCesium()}
        {this.getCrazyEgg()}
        {this.getUserReport()}
      </HeadNext>
    );
  }
}

export default HeadApp;
