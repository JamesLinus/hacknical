import React from 'react';
import ReactDOM from 'react-dom';
import Api from 'API/index';
import github from 'UTILS/github';
import chart from 'UTILS/chart';
import Chart from 'chart.js';
import ChartInfo from 'COMPONENTS/ChartInfo';

class Share extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      repos: [],
      commitDatas: [],
      reposLanguages: []
    };
    this.reposChart = null;
  }

  componentDidMount() {
    const { login } = this.props;
    Api.github.getShareInfo(login).then((result) => {
      const { repos, commitDatas } = result;
      this.setState({
        repos,
        commitDatas,
        reposLanguages: [...github.getReposLanguages(repos)]
      });
    });
  }

  componentDidUpdate() {
    this.renderCharts();
  }

  renderCharts() {
    const { repos } = this.state;
    if (repos.length) {
      !this.reposChart && this.renderReposChart(repos.slice(0, 10));
    }
  }



  renderReposChart(repos) {
    const { commitDatas } = this.state;
    const reposReview = ReactDOM.findDOMNode(this.reposReview);
    this.reposChart = new Chart(reposReview, {
      type: 'bar',
      data: {
        labels: github.getReposNames(repos),
        datasets: [
          chart.getStarDatasets(repos),
          chart.getForkDatasets(repos),
          chart.getCommitDatasets(repos, commitDatas)
        ]
      },
      options: {
        title: {
          display: true,
          text: ''
        },
        scales: {
          xAxes: [{
            display: false,
            gridLines: {
              display:false
            }
          }],
          yAxes: [{
            display: false,
            gridLines: {
              display:false
            },
            ticks: {
              beginAtZero:true
            }
          }]
        },
      }
    });
  }

  render() {
    const { repos, commitDatas } = this.state;
    const [totalStar, totalFork] = github.getTotalCount(repos);

    const maxStaredRepos = repos[0] ? repos[0].name : '';
    // const maxTimeRepos = github.longestContributeRepos(repos);
    // const startTime = maxTimeRepos['created_at'].split('T')[0];
    // const pushTime = maxTimeRepos['pushed_at'].split('T')[0];

    const yearlyRepos = github.getYearlyRepos(repos);
    const totalCommits = commitDatas[0] ? commitDatas[0].totalCommits : 0;

    return (
      <div>
        <div className="share_info_chart">
          <canvas ref={ref => this.reposReview = ref}></canvas>
        </div>
        <div className="share_repos_info">
          <ChartInfo
            icon="star-o"
            mainText={totalStar}
            subText="收获 star 数"
          />
          <ChartInfo
            icon="code-fork"
            mainText={totalFork}
            subText="收获 fork 数"
          />
          <ChartInfo
            icon="cubes"
            mainText={yearlyRepos.length}
            subText="创建的仓库数"
          />
        </div>
        <div className="share_repos_info">
          <ChartInfo
            icon="code"
            mainText={totalCommits}
            subText="单个仓库最多提交数"
          />
          <ChartInfo
            icon="cube"
            mainText={maxStaredRepos}
            subText="最受欢迎的仓库"
          />
        </div>
      </div>
    )
  }
}

export default Share;