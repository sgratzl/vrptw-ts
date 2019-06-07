import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {IWithStore} from '../stores/interfaces';
import {withStyles, createStyles, Theme, WithStyles} from '@material-ui/core/styles';
import classNames from 'classnames';
import {scaleLinear, scaleBand} from 'd3';
import SolutionNode from '../model/SolutionNode';
import ContainerDimensions from 'react-container-dimensions';
import {IconButton, Typography} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import {bind} from 'decko';

const styles = (_theme: Theme) => createStyles({
  root: {
    display: 'flex',

  },
  chart: {
    flex: '1 1 0',
    position: 'relative',
    '& > svg': {
      position: 'absolute'
    }
  },
  main: {
    flex: '1 1 0',
    display: 'flex',
    position: 'relative',
    alignItems: 'flex-end',
    padding: '0 1rem',
    borderBottom: '2px solid black',
  },
  axis: {
    width: '5em',
  },
  bar: {
    fill: 'lightgrey',
    cursor: 'pointer',
  },
  selected: {
    boxShadow: '0 0 5px 3px orange'
  },
  xaxis: {
    '& line': {
      stroke: 'black',
      strokeWidth: 2
    },
    '& text': {
      textAnchor: 'middle',
      dominantBaseline: 'hanging'
    }
  },
  yaxis: {
    '& line': {
      stroke: 'black',
      strokeWidth: 2
    },
    '& text': {
      textAnchor: 'end',
      dominantBaseline: 'central'
    }
  },
  adder: {
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
});



export interface ISolutionHistoryProps extends WithStyles<typeof styles>, IWithStore {

}

@inject('store')
@observer
class HistoryBarChart extends React.Component<ISolutionHistoryProps & {width: number, height: number}> {
  private onBarClick(solution: SolutionNode) {
    const store = this.props.store!;
    if (!store.leftSelectedSolution) {
      store.leftSelectedSolution = solution;
    } else {
      store.rightSelectedSolution = solution;
    }
    if (!store.gallerySolutions.includes(solution)) {
      store.gallerySolutions.push(solution);
    }
  }

  render() {
    const {width, height, classes} = this.props;
    const store = this.props.store!;

    const yscale = scaleLinear().domain([0, store.maxDistance]).rangeRound([height - 20, 20]);
    const xscale = scaleBand().domain(store.solutions.map((d) => d.name)).range([80, width - 20]).padding(0.1);

    let bandwidth = xscale.bandwidth();
    let step = xscale.step();

    if (bandwidth > 50) {
      // limit to bandwidth 50 and 5px distance
      bandwidth = 50;
      step = 5;
    }
    const start = xscale.range()[0] + step;



    return <svg width={width} height={height}>
      <g>
        {store.solutions.map((s, i) => <rect
          key={s.id} className={classNames(classes.bar, {[classes.selected]: store.hoveredSolution === s})}
          x={start + (bandwidth + step) * i} y={yscale(s.distance)} width={bandwidth} height={yscale.range()[0] - yscale(s.distance)}
          onMouseEnter={() => store.hoveredSolution = s} onMouseLeave={() => store.hoveredSolution = null}
          onClick={() => this.onBarClick(s)}
        />)}
      </g>
      <g transform={`translate(${0},${yscale.range()[0]})`} className={classes.xaxis}>
        <line x1={xscale.range()[0]} x2={xscale.range()[1]} />
        {store.solutions.map((s, i) => <g key={s.id} transform={`translate(${start + (bandwidth + step) * i + bandwidth / 2}, 0)`} >
            <line y2={3} />
            <text y={5} >{s.name}</text>
        </g>)}
      </g>
      <g transform={`translate(${xscale.range()[0]},0)`} className={classes.yaxis}>
        <line y1={yscale.range()[0]} y2={yscale.range()[1]} />
        {yscale.ticks().map((s) => <g key={s} transform={`translate(0,${yscale(s)!})`} >
          <line x1={-3} />
          <text x={-5}>{yscale.tickFormat()(s)}</text>
        </g>)}
      </g>
    </svg>;
  }
}

@inject('store')
@observer
class SolutionHistory extends React.Component<ISolutionHistoryProps> {
  @bind
  private freshSolution() {
    this.props.store!.solveFresh();
  }


  render() {
    const classes = this.props.classes;

    return <div className={classes.root}>
      <Typography component="div" className={classes.chart}>
        <ContainerDimensions>
          {(args) => <HistoryBarChart {...args} classes={classes}/>}
        </ContainerDimensions>
      </Typography>
      <div className={classes.adder}>
        <IconButton onClick={this.freshSolution} color="primary">
          <AddIcon />
        </IconButton>
      </div>
      {/* <Axis scale={scale} className={classes.axis}/>
      <div className={classes.main}>
        {store.solutions.map((s) => <div
          key={s.id} className={classNames(classes.bar, {[classes.selected]: store.hoveredSolution === s})}
          title={s.name} data-distance={`${Math.round(s.distance / 100) / 10} km`} style={{height: `${scale(s.distance)}%`}}
          onMouseEnter={() => store.hoveredSolution = s} onMouseLeave={() => store.hoveredSolution = null}
          onClick={() => this.onBarClick(s)}
        />)}
      </div> */}
    </div>;
  }
}

export default withStyles(styles)(SolutionHistory);
