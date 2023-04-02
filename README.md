## ✨ 프로젝트 소개
* 정적웹호스팅을 이용한 HTTPS 사이트 구축

  * 정적 웹 호스팅을 이용해 복잡한 서버 측 처리 없이 파일을 빠르고 효율적으로 제공합니다. 
  * HTTPS를 이용해 클라이언트와 서버 간에 전송되는 데이터를 암호화하여 보안과 신뢰를 제공합니다.



## 🌐 서비스 아키텍쳐
![스크린샷 2023-03-30 150512](https://user-images.githubusercontent.com/118710033/228870474-1c6b8baf-633c-4a98-97a8-b1dec287387f.png)



## 📌 서비스 구성  
어떻게 만드었는지 이미지랑 같이 설명하고 이걸 왜 사용했는지도 명명

<details>
<summary>AWS S3 버킷 생성 후 정적 웹 호스팅 설정</summary>
 
* 버컷 생성 후 하단 부분에 정적 웹 사이트 호스팅 설정
* 설정이 완료되면 버킷 엔드포인트 URL이 생성됨

* 정적 웹 호스팅 사용 이유
  * 동적인 데이터베이스 엑세스가 없는 정적인 웹 html일 경우, 사용한 만큼만 지불하는 S3에 넣어 호스팅하는것이 저렴하다
  * 한꺼번에 많은 사람들이 몰려도 S3 자체가 내구성이 좋기 때문에 오토스케일링, 로드밸런서 작업이 필요없다. 
</details>

<details>
<summary>ACM을 통한 SSL 인증서 발급 및 적용</summary>
 
* Route53에서 구매한 도메인을 기준으로 ACM에서 SSL 인증서를 발급
* Route53에 레코드 생성 및 도메인 CNAME값 등록
  * ACM에서 인증서를 발급 받을 때, 해당 도메인 이름의 소유자인지 확인하기 위해 DNS 레코드를 생성해야 합니다.
</details>

<details>
<summary>CDN 및 HTTPS 적용</summary>

* 백엔드 HTTPS 적용
  * ALB생성 시 계획 설정 부분을 인터넷 연결로 설정하여 익스터널 LB를 설정한다
  * 리스너에 443번 포트를 설정하며 SSL 인증서를 게시하여 SSL Offload를 실시한다.
* 프론트엔드 HTTPS/CDN 적용
  * 원본 도메인 및 S3 설정
  * Viewer protocol policy의 설정을 Redirect HTTP to HTTPS로 지정
  * 대체도메인(CNAME)과 인증 받은 도메인의 이름이 같아야 한다.
</details>

<details>
<summary>Route 53을 이용한 도메인 연결</summary>

* 백엔드와 프론트엔드의 별칭 레코드를 Route53 호스팅 영역에 생성한다
* 레코드 이름에 CloudFront에서 설정한 CNAME을 입력해준다. (전체 레코드이름 = 배포할 주소)
* 트래픽 라우팅 대상은 CloudFront 배포에 대한 별칭 클릭
* CloudFront 배포 주소를 Route 53에서 연결한다.
</details>


## 💪 무엇을 배웠는가?
* 정적 웹 호스팅 사례에 대해 생각해 볼 수 있었습니다.
  * 예를들어, 이벤트 페이지나 사전등록 페이지 처럼 사람들이 한꺼번에 몰렸다가 빠지는 페이지를 웹서버로 호스팅 하면 그것에 대비하여 미리 서버를 사두거나 오토스케일링으로 EC2를 늘려야 하지만 S3로 호스팅 했을 경우에는 필요없다. 하지만 동적인 데이터베이스 엑세스가 필요한 경우, S3는 이를 지원하지 않기 때문에 다른 호스팅 옵션을 고려해야 함.
  
  
* S3 Presigned URL과 같이 S3 버킷 정책에 대해 공부해볼 수 있었습니다.


* 서브넷망에 따른 ELB의 설정과 리스너, 규칙, 타겟 그룹 설정을 알게 되었습니다.
  * 내부통신을 위한 인터널과 외부통신을 위한 익스터널에 대해 알게 되었음.
  
  
* S3와 Cloudfront를 같이 사용하며 oac, acm, 버킷정책을 통한 보안 방법에 대해 공부할 수 있었습니다.
  * S3가 퍼블릭한 환경에 있을 경우 보안상 안전하지 않고 이것을 어떻게 해결 할 수 있을지 고민함.
    * Cloudfront에 oac를 사용함으로써 단일 트래픽 경로를 이용해 해결할 수 있다는 것을 알았음.
    * CloudFront에 Signed Cookies를 사용하여 웹 어플리케이션이 생성한 쿠키를 사용하여 요청이 오리진에서 생성된 것인지 확인 가능함.

## 🚨 트러블 슈팅
* 문제 상황
  * 새로운 파일을 업로드하려고 할 때, 파일이 정상적으로 업로드되지 않았음.
* 원인 파악
  * CloudFront 캐시는 파일이나 리소스를 미리 저장해둔 것으로, 새로운 파일을 업로드하더라도 이미 캐시된 파일이 여전히 사용되는 경우가 있는것을 알게 됨.
  * 캐시의 개념은 알고 있었지만 캐시가 남고 회수되는 개념은 생각하지 못 했음.
  * 이런 경우 캐시가 남아 있는지 확인하고, 캐시된 파일을 무효화해야 함.
* 문제 해결
  * Cloudfront 무효화 설정을 이용해 남아 있는 캐시를 삭제 시킴
  
## 📋 블로깅 & 레퍼런스
* 블로깅
  * https://jihoon555.tistory.com/49?category=1064761
  * https://jihoon555.tistory.com/51?category=1064761
 
* 레퍼런스 
  * https://docs.aws.amazon.com/ko_kr/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html
  * https://docs.aws.amazon.com/ko_kr/AmazonS3/latest/userguide/HostingWebsiteOnS3Setup.html
  * https://dev.mysql.com/doc/refman/8.0/en/connecting-disconnecting.html
