---
title: "[fetch] Promise - 포트원 결제 관련"
tags: []
date: 2024-08-20
notion_id: 6be83960-cc7a-441c-953e-d48cf9042daa
notion_last_edited: 2026-06-28T08:31:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2024-08-20

## before


```javascript
// 포트원에 결제 요청
  const postPaymentPortOne = useCallback(async () => {
    try {
      if (!verifyingRequire()) return;

      if (!window.IMP) {
        throw new Error("포트원 SDK 로드 실패");
      }

      const paymentData = await createPaymentData();

      window.IMP.request_pay(paymentData, async (res) => {
        const { imp_uid, merchant_uid, paid_amount, name } = res;
        try {
          // console.log("포트원 결제", res);
          if (res.success) {
            const paymentInfo = await handlePayResToServer(res);
            if (!paymentInfo) return;

            navigate(
              `/reservation/complete?result=${JSON.stringify(paymentInfo)}`,
              {
                replace: true,
              }
            );
          } else {
            throw new Error(res);
          }
        } catch (error) {
          console.error("결제 처리 중 오류 발생", error, res);
          // console.log("결제 처리 res", res);
          openAlertModal("결제 처리 중 오류가 발생했습니다");
          // 결제가 성공했지만 서버로의 송신이 실패한 경우 포트원 결제 취소
          await postPaidCancel(merchant_uid, paid_amount, name);
        }
      });
    } catch (error) {
      console.error("결제 요청 중 오류", error);
      openAlertModal("결제 요청 중 오류가 발생하였습니다.");
    }
  }, [verifyingRequire, createPaymentData, handlePayResToServer, navigate]);
```


## after


```javascript
const postPaymentPortOne = useCallback(async () => {
  try {
 if (!verifyingRequire()) return;

    if (!window.IMP) {
      throw new Error("포트원 SDK 로드 실패");
    }

    const paymentData = await createPaymentData();

    return new Promise((resolve, reject) => {
      window.IMP.request_pay(paymentData, async (res) => {
        const { imp_uid, merchant_uid, paid_amount, name, error_msg } = res;
        
        if (res.success) {
          try {
            const paymentInfo = await handlePayResToServer(res);
            if (!paymentInfo) {
              throw new Error("서버 응답 실패");
            }
            resolve(paymentInfo);
            navigate(`/reservation/complete?result=${JSON.stringify(paymentInfo)}`, { replace: true });
          } catch (serverError) {
            console.error("서버 처리 중 오류:", serverError);
            await handlePaymentCancel(merchant_uid, paid_amount, name, "서버 처리 실패");
            reject(new Error("결제는 성공했지만 서버 처리 중 오류가 발생했습니다."));
          }
        } else {
          console.error("결제 실패:", error_msg);
          reject(new Error(error_msg || "결제가 실패했습니다."));
        }
      });
    });
  } catch (error) {
    console.error("결제 요청 중 오류:", error);
    openAlertModal(getErrorMessage(error));
    throw error;
  }
}, [verifyingRequire, createPaymentData, handlePayResToServer, navigate]);

// 에러 메시지 생성 함수
const getErrorMessage = (error) => {
  switch(error.message) {
    case "포트원 SDK 로드 실패":
      return "결제 시스템을 불러오는데 실패했습니다. 페이지를 새로고침 해주세요.";
    case "서버 응답 실패":
      return "결제는 성공했지만 주문 처리 중 문제가 발생했습니다. 고객센터로 문의해 주세요.";
    default:
      return "결제 처리 중 오류가 발생했습니다. 다시 시도해 주세요.";
  }
};

// 결제 취소 처리 함수
const handlePaymentCancel = async (merchant_uid, paid_amount, name, reason) => {
  try {
    await postPaidCancel(merchant_uid, paid_amount, name);
    console.log("결제 취소 성공:", reason);
  } catch (cancelError) {
    console.error("결제 취소 실패:", cancelError);
    openAlertModal("결제 취소에 실패했습니다. 고객센터로 문의해 주세요.");
  }
};
```
