import { connect } from 'react-redux';

// actions
import { toggleModal, setModalOptions } from 'redactions/modal';
import { toggleTooltip } from 'redactions/tooltip';

// selectors
import { isFullScreen, hasUserReport } from './selectors';

// component
import LayoutApp from './component';

export default connect(
  state => ({
    modal: state.modal,
    user: state.user,
    isFullScreen: isFullScreen(state),
    showUserReport: hasUserReport(state)
  }),
  {
    toggleModal,
    setModalOptions,
    toggleTooltip
  }
)(LayoutApp);
