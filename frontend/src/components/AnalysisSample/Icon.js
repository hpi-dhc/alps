import React from 'react';
import PropTypes from 'prop-types';
import generateColor from '@eknowles/color-this';
import LabelIcon from '@material-ui/icons/Label';

AnalysisSampleIcon.propTypes = {
  sample: PropTypes.object.isRequired,
};

export default function AnalysisSampleIcon ({ sample, ...props }) {
  const color = generateColor(sample.label);

  return (
    <LabelIcon
      component={svgProps => {
        return (
          <svg {...svgProps}>
            {React.cloneElement(svgProps.children[0], {
              fill: color,
            })}
          </svg>
        );
      }}
      {...props}
    />
  );
}
