import React from 'react';
import { useSession } from '../../api/sessions';

const withSession = Component => ({ match, ...props }) => {
  const id = match.params.sessionId;
  const { data, isLoading, isError } = useSession(id);

  if (isLoading || !Object.keys(data).length) {
    return <div>Loading</div>;
  }

  if (isError) {
    return <div>Failed loading</div>;
  }

  return <Component session={data} match={match} {...props} />;
};

export default withSession;
