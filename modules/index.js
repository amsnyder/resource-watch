import { handleModule } from 'redux-tools';

// third-party modules
import { reducer as toastr } from 'react-redux-toastr';
import { reducers as widgetEditorModules } from 'widget-editor';
import { reducer as responsiveReducer } from 'react-responsive-redux';

// local modules
import dashboardsModule from './dashboards';
import partnersModule from './partners';
import staticPagesModules from './static-pages';
import topicsModule from './topics';

export default {
  // local modules
  dashboards: handleModule(dashboardsModule),
  partners: handleModule(partnersModule),
  staticPages: handleModule(staticPagesModules),
  topics: handleModule(topicsModule),
  // third-party modules
  toastr,
  ...widgetEditorModules,
  responsive: responsiveReducer
};

