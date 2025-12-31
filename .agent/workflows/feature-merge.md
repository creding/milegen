---
description: Merge a feature branch into develop, push, then merge develop into main and push.
---

1. Check status and add all changes

```bash
git status
git add .
```

2. Commit changes (User should provide message)

```bash
git commit -m "feat: <YOUR_MESSAGE_HERE>"
```

3. Switch to develop, merge, and push
   // turbo

```bash
git checkout develop
git merge <FEATURE_BRANCH_NAME>
git push origin develop
```

4. Switch to main, merge develop, and push
   // turbo

```bash
git checkout main
git merge develop
git push origin main
```

5. (Optional) Delete the feature branch

```bash
# git branch -d <FEATURE_BRANCH_NAME>
```
