---
title: ''
summary: ''
date: 2022-10-24
type: landing

design:
  spacing: '6rem'

sections:
  - block: resume-biography-3
    id: about
    content:
      username: me
      text: |-
        My research lies at the intersection of **biomedical engineering** and **AI**,
        developing non-invasive diagnostic systems using PPG signals.
        I work closely with clinical partners at Severance Hospital on
        IRB-approved studies for cardiovascular and emergency medicine applications.
      button:
        text: Download CV
        url: uploads/resume.pdf
      headings:
        about: ''
        education: ''
        interests: ''
    design:
      background:
        gradient_mesh:
          enable: false
      name:
        size: md
      avatar:
        size: medium
        shape: circle

  - block: collection
    id: projects
    content:
      title: Research Projects
      filters:
        folders:
          - project
      count: 0
    design:
      view: showcase
      columns: 1

  - block: collection
    id: publications
    content:
      title: Publications
      filters:
        folders:
          - publication
        featured_only: false
      count: 0
    design:
      view: citation

  - block: markdown
    id: patents
    content:
      title: Patents
      subtitle: ''
      text: |-
        1. **H. J. Lee**, J. S. Lee, "Non-Newtonian fluid viscosity modeling of patient blood using wearable device-based PPG and biometric information"
           - Korea — Application No. 10-2024-0026709

        2. **H. J. Lee**, J. S. Lee, "An algorithm that collects PPG and biometric information from wearable devices and analyzes it to predict systolic and diastolic viscosity"
           - Korea — Application No. 10-2024-0028201

        3. **H. J. Lee**, J. S. Lee, "Glucose and diabetes prediction algorithm using wearable device-based PPG and biometric information"
           - Korea — Application No. 10-2023-0144347

        4. J. S. Lee, W. R. Choi, **H. J. Lee**, "A wearable device for monitoring glaucoma suspect and a method for monitoring glaucoma suspect"
           - Korea — Application No. 10-2023-0144347

        5. **H. J. Lee**, J. S. Lee, "Glaucoma Diagnosis Method and System Based on Contactless Biosignals"
           - Korea — Application No. 10-2023-0078883

        6. **H. J. Lee**, J. S. Lee, S. C. Ko, "Noninvasive Urodynamics Test Method and Apparatus Based on Artificial Intelligence"
           - Korea — Application No. 10-2022-0085583

        7. J. S. Lee, Y. W. Kim, **H. J. Lee**, "Optimization system and method of AI algorithm for prediction coronary artery lesions based on FFR"
           - Korea — Application No. 10-2022-0030019
           - US — Application No. 17/820,819
    design:
      columns: '1'

  - block: markdown
    id: conferences
    content:
      title: Conferences
      subtitle: ''
      text: |-
        ### International Conferences

        1. **H. J. Lee**, J. H. Kim, Y. W. Kim, D. S. Kim, S. Y. Shin, J. H. Hong, J. S. Lee, "Patient-Specific Coronary Flow Field Prediction Using Physics-Informed Neural Operators", *The 18th Asian Congress of Fluid Mechanics (ACFM)*, Seoul, Korea (2025) — oral

        2. **H. J. Lee**, Y. W. Kim, J. H. Kim, S. Y. Shin, S. L. Lee, C. H. Kim, J. S. Kim, K. S. Chung, J. S. Lee, "AI-based Hemorheology Prediction with Patient-Specific Biometric Boundary Conditions", *2024 ICTAM*, Daegu, Korea (2024) — short oral & poster

        3. **H. J. Lee**, J. S. Lee, "Optimization of Artificial Intelligence Algorithms for FFR Prediction in Gray Zone", *2022 ICTME*, Gyeonggi-do, Korea (2022) — oral

        4. **H. J. Lee**, Y. W. Kim, J. H. Kim, J. S. Lee, "Estimating CFD-based CT FFR using lattice Boltzmann method — 3D geometry auto segmentation and novel patient specific computation", *ESCHM-ISCH-ISB 2021 FUKUOKA*, Fukuoka, Japan (2021) — oral

        ---

        ### Domestic Conferences

        1. **H. J. Lee**, J. S. Lee, "Unlocking Predictive Health Outcomes with Biometric Data", *KSME Conference 2023*, Songdo, Korea (2023) — oral

        2. **H. J. Lee**, J. S. Lee, "Modeling Coronary Artery Hemodynamics: Exploring DCNN Surrogate Models in Preliminary Research", *BESCO Summer Meeting*, Daegu, Korea (2023) — oral

        3. **H. J. Lee**, J. S. Lee, "Artificial Intelligence Algorithms for FFR Prediction in Gray Zone by Single-view Angiography", *BESCO Winter Meeting*, Seoul, Korea (2022) — short oral & poster, **Nominee for Best Paper Award**

        4. **H. J. Lee**, J. H. Kim, J. S. Lee, "Artificial intelligence-based automatic cardiovascular lesion prediction diagnostic device", *BESCO Summer Meeting*, Jeju, Korea (2022) — poster

        5. **H. J. Lee**, Y. W. Kim, J. S. Lee, "Optimization of Artificial Intelligence Algorithms for FFR Prediction in Gray Zone", *BESCO Winter Meeting*, Gangwon, Korea (2021) — oral
    design:
      columns: '1'

  - block: markdown
    id: contact
    content:
      title: Contact
      subtitle: ''
      text: |-
        Feel free to reach out via email or connect with me on the platforms below.

        **Email:** [kochujam369@gmail.com](mailto:kochujam369@gmail.com)

        [GitHub](https://github.com/Good-day-commander) · [Google Scholar](https://scholar.google.com/citations?user=1NxM3T0AAAAJ&hl=ko) · [LinkedIn](https://www.linkedin.com/in/hyeong-jun-lee-389435247/)
    design:
      columns: '1'
---
