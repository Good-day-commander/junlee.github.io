---
title: ''
summary: ''
date: 2022-10-24
type: landing

design:
  spacing: '5rem'

sections:
  - block: resume-biography-3
    id: about
    content:
      username: me
      text: |-
        **Bridging hemodynamics and AI for non-invasive clinical decision support.**

        I am a PhD candidate in mechanical engineering at Yonsei University, working at the intersection of **computational fluid dynamics**, **wearable photoplethysmography**, and **clinically grounded machine learning**. My research focuses on translating physiological signals and patient-specific flow modeling into diagnostic intelligence that can support cardiovascular and emergency medicine.

        Recent work includes a **physics-integrated deep learning framework for patient-specific blood viscosity assessment from wearable PPG**, along with ongoing studies on **continuous PPG-based hemodynamic vulnerability detection** in emergency care settings.
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
        size: xl
      avatar:
        size: large
        shape: circle

  - block: markdown
    id: snapshot
    content:
      title: Research Snapshot
      subtitle: ''
      text: |-
        <div class="research-snapshot-grid">
          <article class="snapshot-card">
            <span class="snapshot-label">Research Focus</span>
            <h3>Wearable Hemodynamics</h3>
            <p>Non-invasive biomarker estimation from PPG, signal-derived physiology, and clinically relevant decision support.</p>
          </article>
          <article class="snapshot-card">
            <span class="snapshot-label">Methods</span>
            <h3>CFD × Deep Learning</h3>
            <p>Lattice Boltzmann simulation, patient-specific flow modeling, physics-informed learning, and data-driven prediction pipelines.</p>
          </article>
          <article class="snapshot-card">
            <span class="snapshot-label">Clinical Translation</span>
            <h3>Hospital Collaboration</h3>
            <p>IRB-approved studies with Severance Hospital spanning cardiovascular diagnostics and emergency medicine applications.</p>
          </article>
          <article class="snapshot-card">
            <span class="snapshot-label">Current Stage</span>
            <h3>Published + Ongoing</h3>
            <p>Peer-reviewed publications, patents, and a current manuscript in submission focused on early fluid intervention prediction.</p>
          </article>
        </div>
    design:
      columns: '1'

  - block: markdown
    id: selected-research
    content:
      title: Selected Research Briefs
      subtitle: ''
      text: |-
        <div class="editorial-lead">
          <p>Rather than listing publications as a conventional archive, the selected studies below outline the broader arc of my research: extracting clinically meaningful information from flow physics, physiological signals, and patient-specific computational models.</p>
        </div>

        <div class="research-brief-grid">
          <article class="research-brief research-brief-featured">
            <div class="research-brief-media">
              <img src="/media/papers/extracted/viscosity-000.png" alt="Workflow figure for wearable PPG-based blood viscosity estimation" loading="lazy">
            </div>
            <div class="research-brief-body">
              <span class="research-badge">Featured Paper · 2025</span>
              <h3>A Physics-Integrated Deep Learning Approach for Patient-Specific Non-Newtonian Blood Viscosity Assessment using PPG</h3>
              <p>This study introduces a patient-specific blood viscosity estimation pipeline from wearable photoplethysmography, combining rheological priors with deep learning to move beyond conventional single-point viscosity estimation.</p>
              <ul>
                <li>Integrates the Carreau–Yasuda rheological model into a hybrid 1D CNN-LSTM framework.</li>
                <li>Targets clinically meaningful viscosity estimation in the physiological shear range.</li>
                <li>Positions wearable PPG as a route toward broader non-invasive circulatory assessment.</li>
              </ul>
              <p class="research-meta"><strong>Journal:</strong> Computer Methods and Programs in Biomedicine (2025) · <a href="https://doi.org/10.1016/j.cmpb.2025.108740">DOI</a></p>
            </div>
          </article>

          <article class="research-brief">
            <div class="research-brief-media">
              <img src="/media/papers/extracted/ffr-000.png" alt="Overall study process for FFR prediction in the gray zone" loading="lazy">
            </div>
            <div class="research-brief-body">
              <span class="research-badge research-badge-muted">Published · 2022</span>
              <h3>Optimization of FFR Prediction in the Gray Zone</h3>
              <p>A coronary decision-support pipeline combining CTA-derived morphology, hemodynamic flow features, and biometric data to improve FFR prediction where diagnosis is often ambiguous.</p>
              <p class="research-meta"><strong>Focus:</strong> Coronary flow AI, feature engineering, patient-specific screening · <a href="https://doi.org/10.1016/j.cmpb.2022.106827">DOI</a></p>
            </div>
          </article>

          <article class="research-brief">
            <div class="research-brief-media">
              <img src="/media/papers/extracted/tricuspid-000.png" alt="Hemodynamic optimization process for a tricuspid membrane mechanism" loading="lazy">
            </div>
            <div class="research-brief-body">
              <span class="research-badge research-badge-muted">Published · 2022</span>
              <h3>Optimization of Tricuspid Membrane Mechanism through Hemodynamic Analysis</h3>
              <p>This work studies the trade-off between treatment effectiveness and leaflet longevity in tricuspid regurgitation, using CFD-based analysis to optimize membrane geometry and insertion conditions.</p>
              <p class="research-meta"><strong>Focus:</strong> Biomedical CFD, valve mechanics, treatment optimization · <a href="https://doi.org/10.1080/19942060.2022.2104929">DOI</a></p>
            </div>
          </article>
        </div>
    design:
      columns: '1'

  - block: markdown
    id: ongoing-work
    content:
      title: Ongoing Clinical AI
      subtitle: ''
      text: |-
        <div class="ongoing-panel">
          <span class="research-badge research-badge-accent">Manuscript in Submission</span>
          <h3>Multi-Model Deep-Learning Ensemble for Predicting 24 h Fluid Bolus Administration from Continuous PPG Spectrograms</h3>
          <p>The current manuscript investigates whether continuous smartwatch-derived PPG can identify apparently stable emergency department patients who may later require fluid bolus administration. The framework combines multi-window spectrogram analysis, diverse CNN backbones, and a weighted ensemble strategy to anticipate hemodynamic vulnerability before overt instability emerges.</p>
          <div class="ongoing-highlights">
            <div>
              <span class="ongoing-label">Setting</span>
              <p>Prospective emergency care cohort with continuous wearable PPG monitoring.</p>
            </div>
            <div>
              <span class="ongoing-label">Method</span>
              <p>Ensemble learning across STFT and CWT spectrogram representations.</p>
            </div>
            <div>
              <span class="ongoing-label">Goal</span>
              <p>Support earlier fluid intervention decisions in clinically ambiguous cases.</p>
            </div>
          </div>
        </div>
    design:
      columns: '1'

  - block: collection
    id: publications
    content:
      title: Publication Archive
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
    id: awards
    content:
      title: Awards & Honors
      subtitle: ''
      text: |-
        - **Merit Academic Paper Award, Graduate School Innovation Outstanding Thesis Awards** — Yonsei University, 2026
        - **Best Paper Award** — BESCO (Biomedical Engineering Society for Circulation), 2022
        - **Merit Academic Paper Award** — Yonsei University, 2022
        - **Best Paper Award** — School of Mechanical Engineering, Yonsei University, 2022
    design:
      columns: '1'

  - block: markdown
    id: conferences
    content:
      title: Conferences
      subtitle: ''
      text: |-
        ### International Conferences

        1. **H. J. Lee**, T. H. Han, J. S. Kim, S. G. Lee, J. S. Lee, "Patient-Specific Coronary Flow Field Prediction Using Physics-Informed Neural Operators", *Design of Medical Devices Conference (DMD2026)*, Minneapolis, MN, USA (2026) — accepted

        2. **H. J. Lee**, J. H. Kim, Y. W. Kim, D. S. Kim, S. Y. Shin, J. H. Hong, J. S. Lee, "Patient-Specific Coronary Flow Field Prediction Using Physics-Informed Neural Operators", *The 18th Asian Congress of Fluid Mechanics (ACFM)*, Seoul, Korea (2025) — oral

        3. **H. J. Lee**, Y. W. Kim, J. H. Kim, S. Y. Shin, S. L. Lee, C. H. Kim, J. S. Kim, K. S. Chung, J. S. Lee, "AI-based Hemorheology Prediction with Patient-Specific Biometric Boundary Conditions", *2024 ICTAM*, Daegu, Korea (2024) — short oral & poster

        4. **H. J. Lee**, J. S. Lee, "Optimization of Artificial Intelligence Algorithms for FFR Prediction in Gray Zone", *2022 ICTME*, Gyeonggi-do, Korea (2022) — oral

        5. **H. J. Lee**, J. H. Kim, Y. W. Kim, J. S. Lee, "Estimating CFD-based CT FFR using lattice Boltzmann method — 3D geometry auto segmentation and novel patient specific computation", *ESCHM-ISCH-ISB 2021 FUKUOKA*, Fukuoka, Japan (2021) — oral

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
        I welcome conversations on hemodynamics, biomedical AI, collaborative clinical research, and translational signal analysis.

        **Email:** [kochujam369@gmail.com](mailto:kochujam369@gmail.com)

        [GitHub](https://github.com/Good-day-commander) · [Google Scholar](https://scholar.google.com/citations?user=1NxM3T0AAAAJ&hl=ko) · [LinkedIn](https://www.linkedin.com/in/hyeong-jun-lee-389435247/)
    design:
      columns: '1'
---

<!-- Design note: Institutional Editorial Modernism. Large editorial type, generous whitespace, report-like blue/teal palette, and selected research briefs instead of startup-style cards. -->
