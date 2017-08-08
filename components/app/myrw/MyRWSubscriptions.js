import React from 'react';
import PropTypes from 'prop-types';

// Redux
import withRedux from 'next-redux-wrapper';
import { initStore } from 'store';

// Services
import UserService from 'services/UserService';

// Components
import Spinner from 'components/ui/Spinner';


class MyRWSubscriptions extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      subscriptions: []
    };

    this.userService = new UserService({ apiURL: process.env.WRI_API_URL });
  }

  componentDidMount() {
    if (!this.props.user.id) {
      this.waitForUserToBeLoaded();
    } else {
      this.loadSubscriptions();
    }
  }

  waitForUserToBeLoaded() {
    setTimeout(() => {
      if (this.props.user.id) {
        this.loadSubscriptions();
      } else {
        this.waitForUserToBeLoaded();
      }
    }, 400);
  }

  loadSubscriptions() {
    this.setState({
      loading: true
    });
    this.userService.getSubscriptions(this.props.user.token)
      .then((data) => {
        this.setState({
          subscriptions: data,
          loading: false
        });
      })
      .catch((err) => {
        this.setState({
          error: err,
          loading: false
        });
      });
  }

  render() {
    const { loading, subscriptions } = this.state;

    return (
      <div className="c-page-section c-myrw-subscriptions">
        <div className="l-container">
          <Spinner isLoading={loading} className="-small -light" />
          <div className="row">
            {subscriptions && subscriptions.map(val =>
              (
                <div
                  className="card-container"
                  key={val.id}
                >
                  <div className="subscription-card medium-4 small-12">
                    {val.attributes.name && <h4>{val.attributes.name}</h4>}
                    <h5>Dataset</h5>
                    {val.attributes.datasets[0]}
                    <h5 className="country-label">Country</h5>
                    {val.attributes.params.iso.country}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    );
  }
}

MyRWSubscriptions.propTypes = {
  // Store
  user: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  user: state.user
});

export default withRedux(initStore, mapStateToProps, null)(MyRWSubscriptions);
