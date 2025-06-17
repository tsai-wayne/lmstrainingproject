const diveLinker = new DiveLinker("dive");
const db = firebase.firestore();
const auth = firebase.auth();

const targetId = "edebe72a9bd44de89fbdbc768b3bd6c5"; // 你的分數屬性ID
let lastRecordedScore = null; // 避免重複記錄相同分數

function waitForDiveLoaded(callback) {
  const intervalId = setInterval(() => {
    if (diveLinker.getLoadingStatus()) {
      clearInterval(intervalId);
      callback();
    } else {
      console.log("⏳ 等待 DiVE 專案載入中...");
    }
  }, 300);
}

window.onload = () => {
  waitForDiveLoaded(() => {
    diveLinker.start();

    auth.onAuthStateChanged(user => {
      if (!user) {
        console.warn("請先登入");
        return;
      }

      setInterval(() => {
        let score = parseInt(diveLinker.getAttr(targetId));
        if (isNaN(score)) score = 0;

        // 如果是有效新分數，且與上一筆不同，才記錄
        if (score > 0 && score !== lastRecordedScore) {
          lastRecordedScore = score;

          db.collection("user_scores")
            .doc(user.uid)
            .collection("records")
            .add({
              score: score,
              timestamp: new Date()
            })
            .then(() => console.log("✅ 成績儲存:", score))
            .catch(err => console.error("❌ 儲存錯誤:", err));
        }
      }, 1000); // 每秒檢查一次（可調整）
    });
  });
};
