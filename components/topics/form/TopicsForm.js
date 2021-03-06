import React from 'react';
import PropTypes from 'prop-types';
import { toastr } from 'react-redux-toastr';

// Utils
import { logEvent } from 'utils/analytics';

// Services
import {
  fetchTopic,
  createTopic,
  updateTopic
} from 'services/topics';

import { STATE_DEFAULT, FORM_ELEMENTS } from 'components/topics/form/constants';

import Navigation from 'components/form/Navigation';
import Step1 from 'components/topics/form/steps/Step1';
import Spinner from 'components/ui/Spinner';

class TopicsForm extends React.Component {
  state = Object.assign({}, STATE_DEFAULT, {
    id: this.props.id,
    loading: !!this.props.id,
    form: {
      ...STATE_DEFAULT.form,
      user_id: this.props.user.id
    }
  });

  componentDidMount() {
    const { id } = this.state;
    // Get the topics and fill the
    // state form with its params if the id exists
    if (id) {
      fetchTopic(id)
        .then((data) => {
          this.setState({
            form: this.setFormFromParams(data),
            // Stop the loading
            loading: false
          });
        })
        .catch((err) => {
          toastr.error('Error', err);
        });
    }
  }

  /**
   * UI EVENTS
   * - onSubmit
   * - onChange
   * - onStepChange
  */
  onSubmit = (event) => {
    const { user, onSubmit } = this.props;
    const { step, form, stepLength, submitting, id } = this.state;
    event.preventDefault();

    // Validate the form
    FORM_ELEMENTS.validate(step);

    // Set a timeout due to the setState function of react
    setTimeout(() => {
      // Validate all the inputs on the current step
      const valid = FORM_ELEMENTS.isValid(step);

      if (valid) {
        logEvent('My RW', 'User creates a new topic', form.name);

        // if we are in the last step we will submit the form
        if (step === stepLength && !submitting) {
          // Start the submitting
          this.setState({ submitting: true });

          // Save data
          if (id) {
            updateTopic(id, form, user.token)
              .then((data) => {
                toastr.success('Success', `The topic "${data.id}" - "${data.name}" has been updated correctly`);
                if (onSubmit) onSubmit();
              })
              .catch((err) => {
                this.setState({ submitting: false });
                toastr.error('Error', `Oops! There was an error updating the topic ${id}, please try again. ${err}`);
              });
          } else {
            createTopic(form, user.token)
              .then((data) => {
                toastr.success('Success', `The topic "${data.id}" - "${data.name}" has been updated correctly`);
                if (onSubmit) onSubmit();
              })
              .catch((err) => {
                this.setState({ submitting: false });
                toastr.error('Error', `Oops! There was an error updating the topic ${id}, please try again. ${err}`);
              });
          }
        } else {
          this.setState({ step: step + 1 });
        }
      } else {
        toastr.error('Error', 'Fill all the required fields or correct the invalid values');
      }
    }, 0);
  }

  onChange = (obj) => {
    const form = Object.assign({}, this.state.form, obj);
    this.setState({ form });
  }

  onStepChange = (step) => {
    this.setState({ step });
  }

  // HELPERS
  setFormFromParams(params) {
    const newForm = {};

    Object.keys(params).forEach((f) => {
      switch (f) {
        // TODO: if the API doesn't send it we won't need to handle it
        case 'photo': {
          if (params[f] && params[f].original !== '/images/original/missing.png') {
            newForm[f] = params[f].original;
          }
          break;
        }
        default: {
          if ((typeof params[f] !== 'undefined' || params[f] !== null) ||
              (typeof this.state.form[f] !== 'undefined' || this.state.form[f] !== null)) {
            newForm[f] = params[f] || this.state.form[f];
          }
        }
      }
    });

    return newForm;
  }

  render() {
    return (
      <form className="c-form" onSubmit={this.onSubmit} noValidate>
        <Spinner isLoading={this.state.loading} className="-light" />

        {(this.state.step === 1 && !this.state.loading) &&
          <Step1
            onChange={value => this.onChange(value)}
            basic={this.props.basic}
            form={this.state.form}
            id={this.state.id}
          />
        }

        {!this.state.loading &&
          <Navigation
            step={this.state.step}
            stepLength={this.state.stepLength}
            submitting={this.state.submitting}
            onStepChange={this.onStepChange}
          />
        }
      </form>
    );
  }
}

TopicsForm.propTypes = {
  user: PropTypes.object,
  id: PropTypes.string,
  basic: PropTypes.bool,
  onSubmit: PropTypes.func
};

export default TopicsForm;
