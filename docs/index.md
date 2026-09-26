---
template: home.html
hide:
  - toc
---

## News

<div class="rw-news-list">
  <div class="rw-news-item">
    <span class="rw-news-date">09/26</span>
    Two papers on model-driven engineering for quantum systems have been accepted at the <a href="https://conf.researchr.org/track/models-2026/models-2026-workshops">Quantum and Model-Driven Engineering workshop at MODELS 2026</a>.
  </div>
  <div class="rw-news-item">
    <span class="rw-news-date">03/25</span>
    New tutorial series on <a href="tutorials/ood/">Object Oriented Design</a> is now available, covering objects & classes, encapsulation, inheritance, and polymorphism — in both English and Chinese!
  </div>
  <div class="rw-news-item">
    <span class="rw-news-date">30/10</span>
    Our paper <span class="rw-paper-title"><a href="https://conf.researchr.org/details/ase-2024/ase-2024-journal-first-papers/13/ACCESS-Assurance-Case-Centric-Engineering-of-Safety-critical-Systems">ACCESS: Assurance Case Centric Engineering of Safety-critical Systems</a></span> accepted by ASE 2024 as a journal first paper!
  </div>
  <div class="rw-news-item">
    <span class="rw-news-date">07/10</span>
    Our paper <span class="rw-paper-title">MESC: Re-thinking Algorithmic Priority/Criticality Inversion for Heterogeneous MCSs</span> accepted by RTSS 2024!
  </div>
  <div class="rw-news-item">
    <span class="rw-news-date">07/10</span>
    Our paper <span class="rw-paper-title">ROTA-I/O: Hardware/Algorithm Co-design for Real-Time I/O Control with Improved Timing Accuracy and Robustness</span> accepted by RTSS 2024!
  </div>
</div>

## About Me

I am a Senior Lecturer (Associate Professor) in Computer Science at the School of Computing and Communications, Lancaster University, UK. I maintain a visiting research collaboration with the Department of Engineering at the University of Cambridge. My background is in Model Driven Engineering (MDE), which I apply to Model Based Systems Engineering (MBSE), high-integrity systems and model-based assurance.

I contribute to the [Structured Assurance Case Metamodel (SACM)](https://www.omg.org/spec/SACM/) from the Object Management Group and the [Goal Structuring Notation (GSN)](https://scsc.uk/gsn?page=gsn%202standard) from the Assurance Case Working Group. I am a certified ISO 26262 Functional Safety Engineer, a Fellow of the Higher Education Academy (FHEA), and a member of INCOSE UK. I lead the development of [Principia](https://principia-modelling.com/), a commercial-grade MBSE toolchain.

Prior to my current position, I had taken the following roles:

<ul class="rw-career-list">
  <li>
    <strong>Research Assistant Professor (2023–2024)</strong> at the <a href="https://www.eng.cam.ac.uk/">Department of Engineering</a>, <a href="https://www.cam.ac.uk">University of Cambridge</a>, UK — worked with <a href="https://www.eng.cam.ac.uk/profiles/lpd25">Dr Lavindra de Silva</a> and <a href="https://www.eng.cam.ac.uk/profiles/ib340">Prof Ioannis Brilakis</a> to explore Digital Twin applications in the construction sector.
  </li>
  <li>
    <strong>Associate Professor (2020–2023)</strong> at the School of Artificial Intelligence, <a href="https://www.dlut.edu.cn">Dalian University of Technology</a>, China — worked on the automated assurance of safety critical systems, to assure the safety of critical systems with AI/ML capabilities.
  </li>
  <li>
    <strong>Research Fellow (2013–2020)</strong> at the Department of Computer Science, <a href="https://www.york.ac.uk/">University of York</a>, UK — worked on Model Based Systems Engineering (MBSE) and its application in safety critical systems. Member of the <a href="https://www.cs.york.ac.uk/research/groups/automated-software-engineering/">Automated Software Engineering research group</a>.
  </li>
  <li>
    <strong>PhD Student (2012–2016)</strong> in the <a href="https://www.cs.york.ac.uk/research/groups/automated-software-engineering/">ASE research group</a>, <a href="https://www.cs.york.ac.uk">Department of Computer Science</a>, <a href="https://www.york.ac.uk">University of York</a>, UK — supervised by <a href="https://www.cs.york.ac.uk/people/?group=Academic%20and%20Teaching%20Staff&username=dkolovos">Prof Dimitris Kolovos</a>. <a href="https://etheses.whiterose.ac.uk/14375/">[Thesis]</a>
  </li>
</ul>

## Research Vision

Modern safety-critical systems must be rigorously justified as acceptably safe before deployment. This justification process — Safety Critical Systems Engineering (SCSE) — demands extensive analysis, verification, and validation across diverse engineering artifacts, tools, and formats, often culminating in a safety case that must withstand independent review and certification. Yet SCSE today remains overwhelmingly manual, creating a bottleneck that intensifies as systems grow in complexity and become increasingly adaptive and open at runtime.

My research tackles this bottleneck by bringing automation to the core activities of SCSE, spanning the following interconnected themes:

**Model Based Systems Engineering & Tooling.** Much of my work is grounded in MBSE, which provides the rigour and machine-processable representations needed for automation. I have contributed to the development of modelling standards — notably [SACM](https://www.omg.org/spec/SACM/) and [GSN](https://scsc.uk/gsn?page=gsn%202standard) — and to the [Epsilon](https://eclipse.dev/epsilon/) model-management platform. I led the development of the Assurance Case Management Environment (ACME) for SACM and GSN. I am now developing [Principia](https://principia-modelling.com/), an MBSE toolchain bringing modelling, simulation and assurance together; its codebase contains approximately 8.86 million lines.

**Traceability & the Digital Thread.** A recurring challenge in systems engineering is maintaining coherent traceability across heterogeneous artifacts produced by different tools throughout the system lifecycle. My work addresses this by establishing model-based digital threads that link requirements, design models, safety analyses, and assurance arguments, enabling automated impact analysis and change propagation when any part of the system evolves.

**Automated Safety Analysis & Assurance.** Working with wonderful collaborators, I have contributed to automated safety case validation, automated system safety analysis (e.g. the [DECISIVE](https://ieeexplore.ieee.org/abstract/document/10347478) framework for iterative design-time safety analysis), formal verification of system behaviours through the integration of theorem provers such as [Isabelle/SACM](https://link.springer.com/article/10.1007/s00165-021-00537-4), and the [ACCESS](https://www.sciencedirect.com/science/article/pii/S0164121224000773) framework for assurance-case-centric engineering of safety-critical systems.

**Digital Twins for Runtime Assurance.** More recently, I have been exploring Digital Twin technologies for runtime monitoring and assurance of systems and systems of systems — from [highway infrastructure maintenance](https://www.sciencedirect.com/science/article/pii/S2666165925000146) to [space launch vehicles](https://www.sciencedirect.com/science/article/pii/S2452414X24000852). Digital Twins offer a promising paradigm for maintaining a live, model-based representation of a system throughout its operational life, enabling continuous assurance even as the system and its environment change.

**AI-augmented software engineering.** My current research direction follows the slogan *“LLMs draft, formal methods discriminate, and assurance cases explain.”* LLMs propose code and system models; formal methods check them against requirements and safety properties; assurance cases present the evidence and reasoning behind the results. Recent work includes [formal-method-guided generation of safety-critical software](https://arxiv.org/abs/2606.22413) and [traceable system models generated from requirements](https://arxiv.org/abs/2607.16708). The first paper is under major revision at ACM TOSEM; the second has been submitted to *Communications Engineering*.

I am always happy to discuss ideas — feel free to reach out by email!

<div class="rw-visitor-counter">
  <script type="text/javascript" src="https://counter.websiteout.com/js/3/9/3391/0"></script>
</div>
