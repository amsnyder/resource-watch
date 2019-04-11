import { connect } from 'react-redux';
import { toggleModal, setModalOptions } from 'redactions/modal';
import { toggleTooltip } from 'redactions/tooltip';
import { setLocale } from 'redactions/common';

import LayoutEmbedComponent from './component';

export default connect(
  state => ({
    modal: state.modal,
    user: state.user,
    routes: state.routes
  }),
  {
    toggleModal,
    setModalOptions,
    toggleTooltip,
    setLocale
  }
)(LayoutEmbedComponent);
