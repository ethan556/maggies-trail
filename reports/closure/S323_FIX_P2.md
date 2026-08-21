# S323 fix packet P2 — word-problems-g3 misconception-named feedback

Fixer: cowork-s323-P2-fixer. Contracts: PREMIUM_PENDING_WORKLOAD_QUEUE.csv rows LESSON-REVISION-g3w-* and CHOICE-0038; reports/closure/S322_ASSESS_F1.md §1–2 (generic ±1 commonError template replaced with real-error-path values and story-named feedback; g3w-03-04:k2 duplicate replaced; g3w-03-02:k3 length clue removed). Standard: reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md (no remedial steps were rewritten in this packet). Staging: reports/closure/cowork-staging/laneA-s323-P2.jsonl.

## g3w-01-01 (reviewedBasisHash 1cb0360a4bf928bd91bdee38ad9d59768b331a126138d54b39be07c5ac20af1f)

k2/ch1 numeric commonErrors were the generic ±1 template (27/29, 32/34). Replaced with real error paths: k2 11 (7+4 added) and 24 (only 6 vans counted); ch1 27 (subtracted the 3 baked) and 57 (added the 12 sold); story-specific fallbacks.

### g3w-01-01:k2

Before:

```json
{
  "prompt": "The hidden total is 7 vans with 4 hikers in each van. How many hikers is that?",
  "commonErrors": [
    {
      "value": 27,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 29,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "The hidden total is 7 vans with 4 hikers in each van. How many hikers is that?",
  "commonErrors": [
    {
      "value": 11,
      "feedback": "11 is 7 + 4. Each of the 7 vans carries a group of 4 hikers, so the equal groups must be multiplied, not added once."
    },
    {
      "value": 24,
      "feedback": "24 counts only 6 vans of 4 hikers. The story has 7 vans, so one whole van of 4 is missing from your count."
    }
  ],
  "fallbackFeedback": "Count 4 hikers for every one of the 7 vans — seven equal groups of 4."
}
```

### g3w-01-01:ch1

Before:

```json
{
  "prompt": "A stand has 42 muffins, sells 12, then bakes 3 more. How many muffins are there now?",
  "commonErrors": [
    {
      "value": 32,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 34,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "A stand has 42 muffins, sells 12, then bakes 3 more. How many muffins are there now?",
  "commonErrors": [
    {
      "value": 27,
      "feedback": "This takes away the 3 baked muffins as well. Baking makes MORE muffins, so the last step adds 3 instead of subtracting it."
    },
    {
      "value": 57,
      "feedback": "This adds the 12 sold muffins. Selling means muffins leave the stand, so the 12 must be subtracted from 42."
    }
  ],
  "fallbackFeedback": "Start at 42. Selling 12 makes the count smaller; baking 3 makes it bigger again."
}
```

## g3w-01-02 (reviewedBasisHash 7663e92403c16d7724a372b65e9031ce59fe65c2842d84af7af6cc75c3d674aa)

k1/k3/ch1 numeric commonErrors were the generic ±1 template. Replaced with real error paths: k1 10 (5+5 added)/20 (forgot the arrived crate, 4×5); k3 24 (forgot the arrived van, 4×6)/11 (5+6 added); ch1 12 (8+4 added)/28 (old count 7×4); story-specific fallbacks.

### g3w-01-02:k1

Before:

```json
{
  "prompt": "After the new crate arrives, there are 5 crates with 5 apples each. How many apples?",
  "commonErrors": [
    {
      "value": 24,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 26,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "After the new crate arrives, there are 5 crates with 5 apples each. How many apples?",
  "commonErrors": [
    {
      "value": 10,
      "feedback": "10 is 5 + 5. Each of the 5 crates holds a group of 5 apples, so the equal groups call for multiplying, not one addition."
    },
    {
      "value": 20,
      "feedback": "20 uses only 4 crates. The new crate has already arrived, so there are 5 crates of 5 apples to count."
    }
  ],
  "fallbackFeedback": "The arrival already happened: 5 crates, 5 apples in each. Combine all five equal groups."
}
```

### g3w-01-02:k3

Before:

```json
{
  "prompt": "After all arrivals, there are 5 vans with 6 hikers each. How many hikers?",
  "commonErrors": [
    {
      "value": 29,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 31,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "After all arrivals, there are 5 vans with 6 hikers each. How many hikers?",
  "commonErrors": [
    {
      "value": 24,
      "feedback": "24 counts only 4 vans of 6. The extra van has already arrived, so all 5 vans carry hikers."
    },
    {
      "value": 11,
      "feedback": "11 is 5 + 6. Five vans each carrying a group of 6 hikers means multiplying the groups, not adding once."
    }
  ],
  "fallbackFeedback": "After all arrivals there are 5 equal groups of 6 hikers. Combine every group."
}
```

### g3w-01-02:ch1

Before:

```json
{
  "prompt": "The group count is now 8 and every team has 4 players. To finish, what is 8 × 4?",
  "commonErrors": [
    {
      "value": 31,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 33,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "The group count is now 8 and every team has 4 players. To finish, what is 8 × 4?",
  "commonErrors": [
    {
      "value": 12,
      "feedback": "12 is 8 + 4. Eight teams of 4 players are equal groups, so this finishing step multiplies."
    },
    {
      "value": 28,
      "feedback": "28 is 7 × 4 — that uses the old team count. The count already grew to 8 teams before this multiplying step."
    }
  ],
  "fallbackFeedback": "The adding is done: the count is 8 teams. Now build 8 equal groups of 4 players."
}
```

## g3w-01-03 (reviewedBasisHash 98751fb518c1705a7af3c8c3f3c53e6725dfad88c32c15a1fa1d0f07b0055092)

k1/k3/ch1 numeric commonErrors were the generic ±1 template. Replaced with real error paths: k1 37 (subtracted the returned 3)/65 (added the taken 14); k3 1 (subtracted the returned 1)/2 (stopped after 24−22); ch1 13 (8+5 added)/35 (7×5, missed a rack); story-specific fallbacks.

### g3w-01-03:k1

Before:

```json
{
  "prompt": "A shelf has 54 markers. Students take 14, then return 3. How many markers remain?",
  "commonErrors": [
    {
      "value": 42,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 44,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "A shelf has 54 markers. Students take 14, then return 3. How many markers remain?",
  "commonErrors": [
    {
      "value": 37,
      "feedback": "This subtracts the 3 returned markers too. Returned markers go BACK on the shelf, so the last step adds 3."
    },
    {
      "value": 65,
      "feedback": "This adds the 14 taken markers. Taking markers off the shelf lowers the count, so 14 must be subtracted from 54."
    }
  ],
  "fallbackFeedback": "Start at 54. Taking 14 lowers the count; returning 3 raises it again."
}
```

### g3w-01-03:k3

Before:

```json
{
  "prompt": "A tray has 24 markers. Students use 22, then return 1. How many markers remain?",
  "commonErrors": [
    {
      "value": 2,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 4,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "A tray has 24 markers. Students use 22, then return 1. How many markers remain?",
  "commonErrors": [
    {
      "value": 1,
      "feedback": "This subtracts the returned marker as well. A returned marker goes back on the tray, so the final step adds 1."
    },
    {
      "value": 2,
      "feedback": "2 is just 24 − 22 — the story is not finished. One marker is returned after the students use 22."
    }
  ],
  "fallbackFeedback": "Two changes happen: 22 markers leave the tray, then 1 comes back."
}
```

### g3w-01-03:ch1

Before:

```json
{
  "prompt": "Before any helmets are borrowed, 8 racks hold 5 helmets each. What is the hidden total?",
  "commonErrors": [
    {
      "value": 39,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 41,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "Before any helmets are borrowed, 8 racks hold 5 helmets each. What is the hidden total?",
  "commonErrors": [
    {
      "value": 13,
      "feedback": "13 is 8 + 5. The 8 racks are equal groups of 5 helmets, so build the hidden total by multiplying."
    },
    {
      "value": 35,
      "feedback": "35 is only 7 racks of 5. Count all 8 racks — one whole rack of 5 helmets is missing."
    }
  ],
  "fallbackFeedback": "Before anything is borrowed, count 5 helmets on each of the 8 racks."
}
```

## g3w-01-04 (reviewedBasisHash 3ee536371c6f444ea6f82d8a49a15f345dba3f31424376602eb562c1819ee84c)

k1/k3/ch1 numeric commonErrors were the generic ±1 template. Replaced with real error paths: k1 18 (24−6 subtracted)/6 (answered the team count); k3 30 (35−5 subtracted)/6 (5×6 falls short of 35); ch1 28 (32−4 subtracted)/9 (added the later extra too soon); story-specific fallbacks.

### g3w-01-04:k1

Before:

```json
{
  "prompt": "24 counters are shared equally among 6 teams. How many counters does each team get?",
  "commonErrors": [
    {
      "value": 3,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 5,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "24 counters are shared equally among 6 teams. How many counters does each team get?",
  "commonErrors": [
    {
      "value": 18,
      "feedback": "18 is 24 − 6. Sharing among 6 teams splits 24 into 6 equal parts — that is dividing, not subtracting."
    },
    {
      "value": 6,
      "feedback": "6 is the number of teams, not one team's share. Split the 24 counters into 6 equal groups and count ONE group."
    }
  ],
  "fallbackFeedback": "Deal the 24 counters out evenly to the 6 teams, then count what one team holds."
}
```

### g3w-01-04:k3

Before:

```json
{
  "prompt": "Find the fair share first: 35 ÷ 5 = ? Think: 5 × ? = 35.",
  "commonErrors": [
    {
      "value": 6,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 8,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "Find the fair share first: 35 ÷ 5 = ? Think: 5 × ? = 35.",
  "commonErrors": [
    {
      "value": 30,
      "feedback": "30 is 35 − 5. The stickers are shared into 5 equal groups, so divide instead of subtracting."
    },
    {
      "value": 6,
      "feedback": "5 × 6 is only 30, which leaves stickers unshared. Find the number that makes 5 × ? reach 35 exactly."
    }
  ],
  "fallbackFeedback": "Ask: 5 equal groups of what number make 35? Skip-count by 5 until you land on 35."
}
```

### g3w-01-04:ch1

Before:

```json
{
  "prompt": "Find the share before one more is added: 32 ÷ 4 = ?",
  "commonErrors": [
    {
      "value": 7,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 9,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "Find the share before one more is added: 32 ÷ 4 = ?",
  "commonErrors": [
    {
      "value": 28,
      "feedback": "28 is 32 − 4. Splitting 32 markers among 4 equal groups is division, not subtraction."
    },
    {
      "value": 9,
      "feedback": "This adds the extra marker too soon. First find just the equal share of 32 among 4 — the added one comes later."
    }
  ],
  "fallbackFeedback": "Share all 32 markers evenly into 4 groups first; the extra marker joins afterward."
}
```

## g3w-02-01 (reviewedBasisHash f4c28a50cfae803b47011ac3c6bf60d082d48f3d5a75f4c4c1b2f881f0a4ea25)

k2/ch1 numeric commonErrors were the generic ±1 template. Replaced with real error paths: k2 24 (28−4 subtracted)/112 (multiplied 4×28, treating the total as a factor); ch1 35 (42−7 subtracted)/7 (repeated the given factor instead of the missing one); story-specific fallbacks.

### g3w-02-01:k2

Before:

```json
{
  "prompt": "Solve 4 × n = 28. What number does n represent?",
  "commonErrors": [
    {
      "value": 6,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 8,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "Solve 4 × n = 28. What number does n represent?",
  "commonErrors": [
    {
      "value": 24,
      "feedback": "24 is 28 − 4. The letter n asks how many are in EACH of the 4 equal groups, so think: 4 × what makes 28?"
    },
    {
      "value": 112,
      "feedback": "112 multiplies 4 × 28, but 28 is the total, not a group. n is the missing group size that makes 4 × n reach 28."
    }
  ],
  "fallbackFeedback": "n stands for the size of one group. Four equal groups of n make 28 in all."
}
```

### g3w-02-01:ch1

Before:

```json
{
  "prompt": "Use the multiplication family: what is 42 ÷ 7?",
  "commonErrors": [
    {
      "value": 5,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 7,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "Use the multiplication family: what is 42 ÷ 7?",
  "commonErrors": [
    {
      "value": 35,
      "feedback": "35 is 42 − 7. Use the multiplication family instead: 7 × what makes 42?"
    },
    {
      "value": 7,
      "feedback": "7 is the number of groups the story already gives. The family fact 7 × ? = 42 asks for the OTHER factor."
    }
  ],
  "fallbackFeedback": "Think of the fact family for 42: seven equal groups of some number make 42."
}
```

## g3w-02-02 (reviewedBasisHash 4228efa3235adbb8360f5eb76ead2c209b1e7bb5a0ef105677075ca94664023a — re-captured after the g3w-03-04 k2 dedup edit shifted this lesson's cross-lesson basis)

k2/ch1 numeric commonErrors were the generic ±1 template. Replaced with real error paths: k2 22 (subtracted the 5 made)/50 (added the 9 given away); ch1 13 (5+8 added)/45 (5×9 fact slip); story-specific fallbacks. k1 (duplicate source) left untouched per S322 contract — the KEEP-side original.

### g3w-02-02:k2

Before:

```json
{
  "prompt": "A class makes 36 markers, gives away 9, then makes 5 more. How many markers are there now?",
  "commonErrors": [
    {
      "value": 31,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 33,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "A class makes 36 markers, gives away 9, then makes 5 more. How many markers are there now?",
  "commonErrors": [
    {
      "value": 22,
      "feedback": "This subtracts the 5 new markers too. Making 5 more ADDS markers, so the final step is + 5."
    },
    {
      "value": 50,
      "feedback": "This adds the 9 given-away markers. Giving away means 9 leave the class, so subtract them from 36."
    }
  ],
  "fallbackFeedback": "Start at 36: giving away 9 lowers the count, making 5 more raises it."
}
```

### g3w-02-02:ch1

Before:

```json
{
  "prompt": "After combining the group counts, the equation has 5 groups of 8. What is the value?",
  "commonErrors": [
    {
      "value": 39,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 41,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "After combining the group counts, the equation has 5 groups of 8. What is the value?",
  "commonErrors": [
    {
      "value": 13,
      "feedback": "13 is 5 + 8. Five equal groups of 8 call for multiplication, not one addition."
    },
    {
      "value": 45,
      "feedback": "45 is 5 groups of 9, not of 8. Skip-count by 8 five times to build this total."
    }
  ],
  "fallbackFeedback": "The combining is done: 5 equal groups with 8 in each. Multiply the groups."
}
```

## g3w-02-03 (reviewedBasisHash e02bde5b1c18b1ec6e72a2053905c5dc2d5d3f547b1940b19980aeb3c5738169)

k2/ch1 numeric commonErrors were the generic ±1 template. Replaced with real error paths: k2 34 (subtracted the returned 5)/39 (stopped after 63−24); ch1 25 (subtracted the returned 3)/28 (stopped after 48−20); story-specific fallbacks.

### g3w-02-03:k2

Before:

```json
{
  "prompt": "A box has 63 markers. Students use 24, then return 5. How many markers remain?",
  "commonErrors": [
    {
      "value": 43,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 45,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "A box has 63 markers. Students use 24, then return 5. How many markers remain?",
  "commonErrors": [
    {
      "value": 34,
      "feedback": "This also subtracts the 5 returned markers. Returned markers go back in the box, so the last step adds 5."
    },
    {
      "value": 39,
      "feedback": "39 is just 63 − 24 — the story has one more change. Five markers are returned after the 24 are used."
    }
  ],
  "fallbackFeedback": "Two changes: 24 markers leave the box, then 5 come back in."
}
```

### g3w-02-03:ch1

Before:

```json
{
  "prompt": "A box has 48 tiles. Builders use 20, then return 3. How many tiles remain?",
  "commonErrors": [
    {
      "value": 30,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 32,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "A box has 48 tiles. Builders use 20, then return 3. How many tiles remain?",
  "commonErrors": [
    {
      "value": 25,
      "feedback": "This subtracts the 3 returned tiles too. Returning tiles raises the count, so add 3 at the end."
    },
    {
      "value": 28,
      "feedback": "28 is only 48 − 20 — the builders also return 3 tiles afterward. Include that last change."
    }
  ],
  "fallbackFeedback": "Start at 48: using 20 lowers the count, returning 3 raises it."
}
```

## g3w-02-04 (reviewedBasisHash 35eb7d29c327240cb8a5fe9bc7656081075bcc012a2995a04499c42c362c0621)

k2/ch1 numeric commonErrors were the generic ±1 template (299/301, 239/241). Replaced with real error paths: k2 30 (dropped zero from 5×60)/65 (5+60 added); ch1 232 (subtracted the returned 4)/236 (stopped after 336−100); story-specific fallbacks.

### g3w-02-04:k2

Before:

```json
{
  "prompt": "For the rounded chain, calculate the first step: 5 × 60 = ?",
  "commonErrors": [
    {
      "value": 299,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 301,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "For the rounded chain, calculate the first step: 5 × 60 = ?",
  "commonErrors": [
    {
      "value": 30,
      "feedback": "30 is 5 × 6 with the zero dropped. 60 is six TENS, not six ones — keep the tens in your product."
    },
    {
      "value": 65,
      "feedback": "65 is 5 + 60. The rounded chain needs 5 equal groups of 60, so multiply them."
    }
  ],
  "fallbackFeedback": "Use the fact 5 × 6, then remember 60 is six tens, so the product is in tens too."
}
```

### g3w-02-04:ch1

Before:

```json
{
  "prompt": "The exact product is 336. A clerk removes 100 apples, then returns 4. How many apples remain?",
  "commonErrors": [
    {
      "value": 239,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 241,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "The exact product is 336. A clerk removes 100 apples, then returns 4. How many apples remain?",
  "commonErrors": [
    {
      "value": 232,
      "feedback": "This subtracts the 4 returned apples as well. Returned apples go back on the pile, so the last step adds 4."
    },
    {
      "value": 236,
      "feedback": "236 is only 336 − 100 — the clerk then returns 4 apples. One more change remains."
    }
  ],
  "fallbackFeedback": "Start from the exact product 336: removing 100 lowers it, returning 4 raises it."
}
```

## g3w-03-01 (reviewedBasisHash 67c291ea346841b825c02bcd55f3405e81801c4e7afc172ee45f8c93188362b1)

k2/ch1 numeric commonErrors were the generic ±1 template. Replaced with real error paths: k2 360 (subtracted the returned 10)/370 (stopped after 400−30); ch1 203 (subtracted the added 26)/229 (stopped after 234−5); story-specific fallbacks.

### g3w-03-01:k2

Before:

```json
{
  "prompt": "The rounded product is 400. A store sells 30 items, then 10 are returned. What checking estimate results?",
  "commonErrors": [
    {
      "value": 379,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 381,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "The rounded product is 400. A store sells 30 items, then 10 are returned. What checking estimate results?",
  "commonErrors": [
    {
      "value": 360,
      "feedback": "This subtracts the returned 10 too. Returned items go back to the store, so the estimate adds 10 back."
    },
    {
      "value": 370,
      "feedback": "370 is only 400 − 30 — the 10 returned items still need to be added back into the estimate."
    }
  ],
  "fallbackFeedback": "From the rounded 400: selling 30 lowers the estimate, the 10 returns raise it."
}
```

### g3w-03-01:ch1

Before:

```json
{
  "prompt": "A display starts with 234 cards. 5 are removed, then 26 are added. How many cards are there now?",
  "commonErrors": [
    {
      "value": 254,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 256,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "A display starts with 234 cards. 5 are removed, then 26 are added. How many cards are there now?",
  "commonErrors": [
    {
      "value": 203,
      "feedback": "This subtracts the 26 added cards too. Added cards JOIN the display, so the last step is + 26."
    },
    {
      "value": 229,
      "feedback": "229 is only 234 − 5 — the 26 added cards are still missing from the count."
    }
  ],
  "fallbackFeedback": "Two changes to 234: removing 5 lowers the count, adding 26 raises it."
}
```

## g3w-03-02 (reviewedBasisHash 50f382e0f54920168a504bb1cc6de442cf362266c1ba23cd0401062b3bab1880)

k2 numeric commonErrors were the generic ±1 template (40/42): replaced with 31 (subtracted the returned 5) and 36 (stopped after 54−18) plus story-specific fallback. k3 MCQ (CHOICE-0038) had a 71-vs-29-char prose-length clue on the correct option: rewrote all four options to parallel lengths (57–66 chars), keeping one defensible answer and misconception-based distractors (parity, multiple-of-7, boxes-were-fuller), no writing clue.

### g3w-03-02:k2

Before:

```json
{
  "prompt": "A shelf begins with 54 markers. Students borrow 18, then return 5. How many markers remain?",
  "commonErrors": [
    {
      "value": 40,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 42,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "A shelf begins with 54 markers. Students borrow 18, then return 5. How many markers remain?",
  "commonErrors": [
    {
      "value": 31,
      "feedback": "This subtracts the 5 returned markers too. Returned markers go back on the shelf, so finish by adding 5."
    },
    {
      "value": 36,
      "feedback": "36 is only 54 − 18 — the story continues: 5 markers are returned after the borrowing."
    }
  ],
  "fallbackFeedback": "Start at 54: borrowing 18 lowers the count, returning 5 raises it."
}
```

### g3w-03-02:k3

Before:

```json
{
  "prompt": "Five boxes hold 7 pencils each and 6 pencils are given away. Why is an answer of 80 impossible?",
  "options": [
    {
      "id": "o0",
      "label": "The boxes begin with only 35 pencils, and giving away lowers that total",
      "correct": true,
      "feedback": "Correct — the result must be below the maximum of 35."
    },
    {
      "id": "o1",
      "label": "Eighty is even",
      "correct": false,
      "feedback": "Parity does not decide reasonableness in this story."
    },
    {
      "id": "o2",
      "label": "Eighty is not a multiple of 7",
      "correct": false,
      "feedback": "After subtraction, the result need not stay a multiple of seven."
    },
    {
      "id": "o3",
      "label": "Eighty is possible",
      "correct": false,
      "feedback": "The story never has more than 35 pencils."
    }
  ]
}
```

After:

```json
{
  "prompt": "Five boxes hold 7 pencils each and 6 pencils are given away. Why is an answer of 80 impossible?",
  "options": [
    {
      "id": "o0",
      "label": "Five boxes of 7 start at 35, and giving away makes the count fall",
      "correct": true,
      "feedback": "Correct — five 7s make 35 at most, and giving 6 away can only lower that."
    },
    {
      "id": "o1",
      "label": "Eighty is an even number, and pencil answers must come out odd",
      "correct": false,
      "feedback": "Even or odd does not decide reasonableness — the story's largest possible total does."
    },
    {
      "id": "o2",
      "label": "Eighty is not a multiple of 7, so it cannot come from the 7s",
      "correct": false,
      "feedback": "After 6 pencils leave, the result need not stay a multiple of 7; the real limit is the starting total."
    },
    {
      "id": "o3",
      "label": "Eighty is possible if the boxes were already full at the start",
      "correct": false,
      "feedback": "Even full boxes hold just 5 × 7 pencils, and giving 6 away only lowers that."
    }
  ]
}
```

## g3w-03-03 (reviewedBasisHash c8b2e89aaeed5234dc18e04fd45d7f73ff7a11ee504bf268e7746c3ab2d3f313)

k2/ch1 numeric commonErrors were the generic ±1 template. Replaced with real error paths tied to this lesson's extra-information concept: k2 42 (used the 3 red bags too, 7×6)/10 (4+6 added); ch1 78 (added the extra 6 display stands)/17 (9+8 added); story-specific fallbacks.

### g3w-03-03:k2

Before:

```json
{
  "prompt": "For the blue-bag question, use 4 blue bags with 6 marbles each. How many blue marbles?",
  "commonErrors": [
    {
      "value": 23,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 25,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "For the blue-bag question, use 4 blue bags with 6 marbles each. How many blue marbles?",
  "commonErrors": [
    {
      "value": 42,
      "feedback": "42 counts the 3 red bags too. The question asks only about the 4 blue bags — the red bags are extra information."
    },
    {
      "value": 10,
      "feedback": "10 is 4 + 6. Four blue bags with 6 marbles each are equal groups, so multiply."
    }
  ],
  "fallbackFeedback": "Use only the numbers the blue-bag question needs: 4 blue bags, 6 marbles each."
}
```

### g3w-03-03:ch1

Before:

```json
{
  "prompt": "Use 9 shelves with 8 books each to answer the shelf question; the story also mentions 6 display stands. How many shelf books?",
  "commonErrors": [
    {
      "value": 71,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 73,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "Use 9 shelves with 8 books each to answer the shelf question; the story also mentions 6 display stands. How many shelf books?",
  "commonErrors": [
    {
      "value": 17,
      "feedback": "17 is 9 + 8. Nine shelves of 8 books are equal groups — multiply them."
    },
    {
      "value": 78,
      "feedback": "This mixes in the 6 display stands. The question counts only shelf books, so the 6 is extra information."
    }
  ],
  "fallbackFeedback": "Only two numbers matter here: 9 shelves and 8 books on each shelf."
}
```

## g3w-03-04 (reviewedBasisHash f17a724706a6f4265907cb3bb48462c252124de2a7ab463d86185d28fb3f07b0)

ch1 numeric commonErrors were the generic ±1 template (40/42): replaced with 25 (subtracted the added 8) and 33 (stopped after 35−2) plus story-specific fallback. k2 was a byte-identical duplicate of g3w-02-02:k1 (5-tables/4-chairs equation MCQ): replaced with an author-your-own-story diagnostic tied to this lesson's i2 equation (4 × 7) − 5 — a draft story that wrongly takes 5 from EACH basket, testing the once-vs-each authoring misconception with length-balanced options.

### g3w-03-04:ch1

Before:

```json
{
  "prompt": "Equal groups make 35 markers. 2 are removed, then 8 are added. How many markers are there now?",
  "commonErrors": [
    {
      "value": 40,
      "feedback": "That is one below the required result; check the stated operation and quantities."
    },
    {
      "value": 42,
      "feedback": "That is one above the required result; recompute the declared step carefully."
    }
  ],
  "fallbackFeedback": "Use the quantities in the order stated and complete only the operation this check asks for."
}
```

After:

```json
{
  "prompt": "Equal groups make 35 markers. 2 are removed, then 8 are added. How many markers are there now?",
  "commonErrors": [
    {
      "value": 25,
      "feedback": "This subtracts the 8 added markers too. Added markers RAISE the count, so the last step is + 8."
    },
    {
      "value": 33,
      "feedback": "33 is only 35 − 2 — the story has one more step: 8 markers are added after the 2 are removed."
    }
  ],
  "fallbackFeedback": "From the 35 markers the groups made: removing 2 lowers the count, adding 8 raises it."
}
```

### g3w-03-04:k2

Before:

```json
{
  "prompt": "\"There are 5 tables with 4 chairs each. 3 chairs break. How many chairs work?\" Which equation matches?",
  "options": [
    {
      "id": "o0",
      "label": "(5 × 4) − 3",
      "correct": true,
      "feedback": "Correct — build the total first, then remove the broken ones; the parentheses hold the hidden step."
    },
    {
      "id": "o1",
      "label": "5 × (4 − 3)",
      "correct": false,
      "feedback": "That breaks 3 chairs at EVERY table before multiplying — the story breaks only 3 in total."
    },
    {
      "id": "o2",
      "label": "5 + 4 − 3",
      "correct": false,
      "feedback": "Adding tables to chairs mixes two different things; 5 tables OF 4 chairs is multiplication."
    },
    {
      "id": "o3",
      "label": "(5 × 4) + 3",
      "correct": false,
      "feedback": "Broken chairs come OUT of the total, so the second step subtracts rather than adds."
    }
  ]
}
```

After:

```json
{
  "prompt": "You want a story answered by (4 × 7) − 5. A draft says: \"4 baskets hold 7 apples each. Then 5 apples are taken from each basket.\" Why does the draft NOT match?",
  "options": [
    {
      "id": "o0",
      "label": "It takes 5 apples from every basket, but the equation subtracts 5 just once",
      "correct": true,
      "feedback": "Correct — \"from each basket\" removes 4 groups of 5. The equation (4 × 7) − 5 removes a single 5 from the whole."
    },
    {
      "id": "o1",
      "label": "It should say 7 baskets with 4 apples in each basket instead of 4 of 7",
      "correct": false,
      "feedback": "Either grouping builds the same product inside the parentheses; the equal-groups part of the draft is fine."
    },
    {
      "id": "o2",
      "label": "It should add 5 apples at the end instead of taking any apples away",
      "correct": false,
      "feedback": "The equation ends with − 5, so apples leaving the story is right. How many TIMES they leave is the problem."
    },
    {
      "id": "o3",
      "label": "Nothing is wrong — the draft already matches the equation exactly",
      "correct": false,
      "feedback": "Read the last sentence again: taking 5 from EACH of the 4 baskets removes more than 5 apples in all."
    }
  ]
}
```
