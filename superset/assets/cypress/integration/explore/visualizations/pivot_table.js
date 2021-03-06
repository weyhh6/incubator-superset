/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
export default () => describe('Pivot Table', () => {
  const PIVOT_TABLE_FORM_DATA = {
    datasource: '3__table',
    viz_type: 'pivot_table',
    slice_id: 61,
    granularity_sqla: 'ds',
    time_grain_sqla: 'P1D',
    time_range: '100+years+ago+:+now',
    metrics: ['sum__num'],
    adhoc_filters: [],
    groupby: ['name'],
    columns: ['state'],
    row_limit: 50000,
    pandas_aggfunc: 'sum',
    pivot_margins: true,
    number_format: '.3s',
    combine_metric: false,
  };

  const TEST_METRIC = {
    expressionType: 'SIMPLE',
    column: {
      id: 338,
      column_name: 'sum_boys',
      expression: '',
      filterable: false,
      groupby: false,
      is_dttm: false,
      type: 'BIGINT',
      optionName: '_col_sum_boys',
    },
    aggregate: 'SUM',
    hasCustomLabel: false,
    fromFormData: false,
    label: 'SUM(sum_boys)',
    optionName: 'metric_gvpdjt0v2qf_6hkf56o012',
  };

  function verify(formData) {
    cy.visitChartByParams(JSON.stringify(formData));
    cy.verifySliceSuccess({ waitAlias: '@getJson', chartSelector: 'table' });
  }

  beforeEach(() => {
    cy.server();
    cy.login();
    cy.route('POST', '/superset/explore_json/**').as('getJson');
  });

  it('should work with single groupby', () => {
    verify(PIVOT_TABLE_FORM_DATA);
    cy.get('.chart-container tr th').then((ths) => {
      expect(ths.find(th => th.innerText.trim() === 'name')).to.not.equal(undefined);
    });
  });

  it('should work with more than one groupby', () => {
    verify({
      ...PIVOT_TABLE_FORM_DATA,
      groupby: ['name', 'gender'],
    });
    cy.get('.chart-container tr th').then((ths) => {
      expect(ths.find(th => th.innerText.trim() === 'name')).to.not.equal(undefined);
      expect(ths.find(th => th.innerText.trim() === 'gender')).to.not.equal(undefined);
    });
  });

  it('should work with multiple metrics', () => {
    verify({
      ...PIVOT_TABLE_FORM_DATA,
      metrics: ['sum__num', TEST_METRIC],
    });
    cy.get('.chart-container tr th').then((ths) => {
      expect(ths.find(th => th.innerText.trim() === 'sum__num')).to.not.equal(undefined);
      expect(ths.find(th => th.innerText.trim() === 'SUM(sum_boys)')).to.not.equal(undefined);
    });
  });

  it('should work with multiple groupby and multiple metrics', () => {
    verify({
      ...PIVOT_TABLE_FORM_DATA,
      groupby: ['name', 'gender'],
      metrics: ['sum__num', TEST_METRIC],
    });
    cy.get('.chart-container tr th').then((ths) => {
      expect(ths.find(th => th.innerText.trim() === 'name')).to.not.equal(undefined);
      expect(ths.find(th => th.innerText.trim() === 'gender')).to.not.equal(undefined);
      expect(ths.find(th => th.innerText.trim() === 'sum__num')).to.not.equal(undefined);
      expect(ths.find(th => th.innerText.trim() === 'SUM(sum_boys)')).to.not.equal(undefined);
    });
  });
});
