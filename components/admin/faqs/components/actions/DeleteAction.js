import React from 'react';
import PropTypes from 'prop-types';

// Services
import FaqsService from 'services/faqs';
import { toastr } from 'react-redux-toastr';

class DeleteAction extends React.Component {
  constructor(props) {
    super(props);

    // BINDINGS
    this.handleOnClickDelete = this.handleOnClickDelete.bind(this);

    // SERVICES
    this.service = new FaqsService({
      authorization: props.authorization
    });
  }

  handleOnClickDelete(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const { data } = this.props;

    toastr.confirm(`Are you sure that you want to delete: "${data.question}"`, {
      onOk: () => {
        this.service.deleteData(data.id)
          .then(() => {
            this.props.onFaqDelete();
            toastr.success('Success', `The faq "${data.id}" - "${data.question}" has been removed correctly`);
          })
          .catch((err) => {
            toastr.error('Error', `The faq "${data.id}" - "${data.question}" was not deleted. Try again. ${err}`);
          });
      }
    });
  }

  render() {
    return (
      <span>
        <a className="c-btn" href="#delete-dataset" onClick={this.handleOnClickDelete}> Remove </a>
      </span>
    );
  }
}

DeleteAction.propTypes = {
  data: PropTypes.object,
  authorization: PropTypes.string,
  onFaqDelete: PropTypes.func
};

export default DeleteAction;
