import React from 'react';
import { remove } from 'utils/request';
import { toastr } from 'react-redux-toastr';

class DeleteAction extends React.Component {
  constructor(props) {
    super(props);

    // BINDINGS
    this.handleOnClickDelete = this.handleOnClickDelete.bind(this);
  }

  handleOnClickDelete(e) {
    const { data, url } = this.props;
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    toastr.confirm(`Are you sure that you want to delete: "${data.name}"?`, {
      onOk: () => {
        remove({
          url: `${url}/${data.id}`,
          headers: [{
            key: 'Authorization',
            value: this.props.authorization
          }],
          onSuccess: () => {
            this.props.onRowDelete(data.id);
          },
          onError: () => {
            toastr.error('Error', 'There was an error with the request. The object was not deleted');
          }
        });
      }
    });
  }

  render() {
    const { href } = this.props;
    return (
      <span>
        <a
          href={href}
          onClick={this.handleOnClickDelete}
          className="c-btn"
        >
          Remove
        </a>
      </span>
    );
  }
}

DeleteAction.propTypes = {
  data: React.PropTypes.object,
  href: React.PropTypes.string,
  url: React.PropTypes.string,

  authorization: React.PropTypes.string,
  onRowDelete: React.PropTypes.func
};

export default DeleteAction;
