import React, { Component } from 'react';

class ResponsiveTable extends Component {
    _head() {
      return (
        <tr>
            <th>Miejsce</th>
            {Object.entries(this.props.columns).map(([colKey, colName]) => {
              return (
                  <th>{colName}</th>
              );
            })}
        </tr>
      );
    }
    
    _rows() {
      var _this = this;
      var lp = 0;
      return (typeof _this.props.rows === 'object') ? _this.props.rows.map(function(row) {
        var values = Object.keys(_this.props.columns).map(function(colName, colKey) {
          return (
            <td data-label={_this.props.columns[colName]}>{row[colName]}</td>
          );
        });
        return (
          <tr><td data-label="Miejsce">{lp+=1}</td>{values}</tr>
        );
      }) : '';
    }
    
    render() {
      return (
        <div className='row'>
          <div className='columns medium-12 large-12 small-centered'>
          <h1 className='text-center page-title'>{this.props.title}</h1>
            <table className="responsive-card-table unstriped">
              <thead>
                {this._head()}
              </thead>
              <tbody>
                {this._rows()}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
};

export default ResponsiveTable;
