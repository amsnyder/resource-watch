import React from 'react';
import DatasetForm from 'components/admin/dataset/form/DatasetForm';
import Title from 'components/ui/Title';
import Layout from 'components/admin/layout/Layout';
import { Router } from 'routes';

export default class DatasetEdit extends React.Component {

  static async getInitialProps({ query }) {
    const datasetID = query.id;
    return { datasetID };
  }

  render() {
    const { datasetID } = this.props;
    return (
      <Layout
        title="Edit dataset"
        description="Edit dataset description..."
      >
        <div className="row">
          <div className="column small-12">
            <Title className="-huge -p-primary">
              Edit Dataset
            </Title>
            <DatasetForm
              application={['rw']}
              authorization={process.env.TEMP_TOKEN}
              dataset={datasetID}
              onSubmit={() => Router.pushRoute('datasets')}
            />
          </div>
        </div>
      </Layout>
    );
  }
}