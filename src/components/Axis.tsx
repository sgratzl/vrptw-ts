import * as React from 'react';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import {ScaleContinuousNumeric} from 'd3-scale';
import {Typography} from '@material-ui/core';
import classNames from 'classnames';

const styles = (_theme: Theme) => createStyles({
  root: {
    position: 'relative',
    borderRight: '2px solid black',
  },
  tick: {
    position: 'absolute',
    right: 0,
    paddingRight: 6,
    fontSize: '80%',
    textAlign: 'right',
    transform: 'translate(0, -2px)translate(0, -50%)',

    '&::before': {
      position: 'absolute',
      content: '""',
      top: '50%',
      height: 1,
      width: 4,
      right: 0,
      borderBottom: '1px solid black',
      textAlign: 'right'
    }
  }
});



export interface IAxisProps extends WithStyles<typeof styles> {
  scale: ScaleContinuousNumeric<any, any>;
  style?: React.CSSProperties;
  className?: string;
}

// class AxisSVG extends AUnmanagedSVGComponent<{scale: ScaleContinuousNumeric<any, any>, width: number, height: number}> {
//   protected initSVG(svg: SVGSVGElement, initialProps: {scale: ScaleContinuousNumeric<any, any>, width: number, height: number}) {
//     const axis = axisLeft(initialProps.scale.copy().domain([initialProps.height, 0]));
//     select(svg).call(axis);

//     return (props: {scale: ScaleContinuousNumeric<any, any>, width: number, height: number}) => {
//       select(svg).call(axis.scale(props.scale.copy().domain([initialProps.height, 0])));
//     };
//   }
// }

class Axis extends React.Component<IAxisProps> {
  render() {
    const {classes, scale} = this.props;

    const tickValues = scale.ticks();
    const formatter = scale.tickFormat();

    return <Typography className={classNames(classes.root, this.props.className)} variant="caption" style={this.props.style}>
      {tickValues.map((v) => <div className={classes.tick} key={v} style={{top: `${100 - scale(v)}%`}} >{formatter(v)}</div>)}
    </Typography>;
  }
}

export default withStyles(styles)(Axis);

