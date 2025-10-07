import http from "k6/http";
import { group, check } from "k6";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import { Trend } from "k6/metrics";

// Define custom metrics
let loginTrend = new Trend("login_duration");
let getGrantsTrend = new Trend("get_grants_duration");

export const options = {
  stages: [
    { duration: "30s", target: 15 }, // Ramp up from 0 to 15 VUs over 30 seconds
  ],
  gracefulStop: "5m",
  thresholds: {
    http_req_duration: ["p(95)<50000"], // 95% of requests should be below 500ms
    http_req_failed: ["rate<0.1"], // Less than 10% of requests should fail
  },
};

function runTest() {
  group("All Test", function () {
    group("Login", function () {
      let body =
        //  JSON.stringify(
        {
          username: "bcanuser33",
          password: "Bcan123!",
        };
      // )
      let res = http.post(`http://localhost:3001/auth/login`, body);
      console.log("Login response code: " + res.status);
      loginTrend.add(res.timings.duration);

      let checkRes = check(res, {
        "login status is 200": (r) => r.status === 201,
        "Login has token": (r) => r.body.includes("token"),
      });

      console.log("Login check result: " + checkRes);
    });

    group("Get All Grants", function () {
      let res = http.get(`http://localhost:3001/grant`);

      let checkRes = check(res, {
        "get all grants status is 200": (r) => r.status === 200,
        "Get all grants has grants": (r) => r.body.length > 0,
      });

      // console.log("Grants" + res.body);
      console.log("Get all grants check result: " + checkRes);
      getGrantsTrend.add(res.timings.duration);
    });

    
  });
}

export default function () {
  runTest();
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: " ", enableColors: true }),
    "results/grant-test-summary.json": JSON.stringify(data), // Save the summary as a JSON file
  };
}
