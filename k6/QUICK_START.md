# Quick Start: Performance Testing

## 30-Second Setup

```bash
# 1. Install k6 (one-time)
brew install k6

# 2. In Terminal 1: Start backend services
npm run dev:auth

# 3. In Terminal 2: Start GraphQL gateway
npm run dev:gateway

# 4. In Terminal 3: Run benchmark
npm run test:perf
```

## What You'll See

The script will:

- ✅ Check k6 is installed
- ✅ Verify services are running
- ✅ Run 3-minute benchmark comparing GraphQL vs REST
- ✅ Generate HTML report with results
- ✅ Show key metrics and improvements

## Expected Results

```
📊 BENCHMARK RESULTS:

┌─ GraphQL Performance ─────────────────┐
│ Response Time (p95): 185ms
│ Response Time (p99): 215ms
│ Error Rate: 0.8%
└────────────────────────────────────────┘

┌─ REST Performance ────────────────────┐
│ Response Time (p95): 378ms
│ Response Time (p99): 445ms
│ Error Rate: 1.2%
└────────────────────────────────────────┘

📈 IMPROVEMENT METRICS:
✓ GraphQL is 51% faster (p95)
```

## Available Commands

```bash
npm run test:perf                # GraphQL vs REST benchmark (default)
npm run test:perf:benchmark      # Same as above
npm run test:perf:load           # Baseline load test
npm run test:perf:spike          # Sudden traffic spike test
npm run test:perf:soak           # 30-minute stability test
npm run test:perf:all            # All tests sequentially
```

## View Results

Reports are saved in `k6/reports/`:

- `benchmark_YYYYMMDD_HHMMSS.json` - Raw metrics
- `benchmark_YYYYMMDD_HHMMSS.log` - Test output
- `report_YYYYMMDD_HHMMSS.html` - Interactive HTML report

Open the HTML report in your browser to see detailed analysis and charts.

## Troubleshooting

**"k6: command not found"**

```bash
brew install k6
```

**"Connection refused" errors**
Make sure services are running:

```bash
# Check if running
lsof -i :3000   # Auth Service
lsof -i :4000   # GraphQL Gateway

# Start if needed
npm run dev:auth
npm run dev:gateway
```

**Inconsistent results**

- Run multiple times to average
- Close other applications
- Check system load

## Next Steps

1. Review HTML report in `k6/reports/`
2. Verify GraphQL performs 40-60% faster
3. Share results with team
4. Schedule weekly benchmarks

See full guide: `docs/PERFORMANCE_TESTING_GUIDE.md`
