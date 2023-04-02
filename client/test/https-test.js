/* eslint-disable no-undef */
const axios = require('axios');
const expect = require('chai').expect;
require('dotenv').config();

describe('HTTPS 적용을 확인합니다.', () => {
  it('1. HTTPS가 잘 적용되었는지 확인합니다.', async () => {
    const res = await axios.get(`${process.env.HTTPS_ADDRESS}`);
    expect(res.data).to.be.eql('Hello World');
  });

  it('2. Elastic Load Balancer 적용여부를 확인합니다.', async () => {
    const result = await axios.get(`${process.env.ELB_DNS_ADDRESS}`);
    expect(result.data).to.be.eql('Hello World');
  });

  it('3. 작성한 아키텍처를 S3에 업로드하고, 주소를 .env에 작성하세요.', async () => {
    const assignment = await axios.get(`${process.env.HTTPS_ARCHITECTURE_IMAGE}`);
    expect(assignment.status).to.be.eql(200);
  });
});
