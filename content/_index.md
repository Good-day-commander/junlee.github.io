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
        Recent work on physics-integrated blood viscosity prediction achieved **81.1% accuracy**
        in clinical trials at Severance Hospital.
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
        size: large
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
