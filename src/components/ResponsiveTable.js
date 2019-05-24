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
            <td data-label={colName}>{row[colName]}</td>
          );
        });
        return (
          <tr><td data-label="LP">{lp+=1}</td>{values}</tr>
        );
      }) : '';
    }
    
    render() {
      return (
        <table className="responsive-table">
          <thead>
            {this._head()}
          </thead>
          <tbody>
            {this._rows()}
          </tbody>
        </table>
      );
    }
};

export default ResponsiveTable;
