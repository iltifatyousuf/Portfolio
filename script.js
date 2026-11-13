(() => {
  "use strict";
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  function closeMenu() {
    menuButton.setAttribute("aria-expanded", "false");
    mobileNav.hidden = true;
    menuButton.querySelector("use").setAttribute("href", "#icon-menu");
  }
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    mobileNav.hidden = isOpen;
    menuButton.querySelector("use").setAttribute("href", isOpen ? "#icon-menu" : "#icon-close");
  });
  mobileNav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !mobileNav.hidden) {
      closeMenu();
      menuButton.focus();
    }
  });
  document.addEventListener("click", event => {
    if (!mobileNav.hidden && !document.querySelector(".header").contains(event.target)) {
      closeMenu();
    }
  });
  window.matchMedia("(min-width: 1001px)").addEventListener("change", event => {
    if (event.matches) closeMenu();
  });

  const navLinks = document.querySelectorAll(".desktop-nav a, .mobile-nav a");
  const pageSections = [...document.querySelectorAll("main section[id]")];
  const header = document.querySelector(".header");
  let activeSectionId;
  function updateActiveSection() {
    const marker = header.getBoundingClientRect().bottom + 48;
    const currentSection = pageSections.find(section => {
      const rect = section.getBoundingClientRect();
      return rect.top <= marker && rect.bottom > marker;
    });
    const nextSectionId = currentSection ? currentSection.id : "";
    if (nextSectionId === activeSectionId) return;
    activeSectionId = nextSectionId;
    navLinks.forEach(link => {
      if (link.hash === "#" + activeSectionId) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }
  document.addEventListener("scroll", updateActiveSection, { passive: true });
  window.addEventListener("resize", updateActiveSection);
  updateActiveSection();

  document.getElementById("year").textContent = new Date().getFullYear();

  document.querySelector(".copy-email").addEventListener("click", async () => {
    const status = document.getElementById("copy-status");
    try {
      await navigator.clipboard.writeText("iltifaatyousuf@gmail.com");
      status.textContent = "Email address copied.";
      const copyButton = document.querySelector(".copy-email");
      copyButton.querySelector("use").setAttribute("href", "#icon-check");
      copyButton.querySelector("span").textContent = "Copied";
    } catch {
      status.textContent = "Email me at iltifaatyousuf@gmail.com";
    }
  });

  const assessmentForm = document.getElementById("assessment-form");
  const briefFields = [
    ["websiteType", "Website type"],
    ["designStyle", "UI/UX design style"],
    ["developmentScope", "Development scope"],
    ["timeline", "Preferred timeline"],
    ["budget", "Expected budget (INR)"]
  ];
  const briefActions = document.getElementById("brief-actions");
  const briefEmail = document.getElementById("assessment-email");
  const assessmentStatus = document.getElementById("assessment-status");
  const copyFallback = document.getElementById("brief-copy-fallback");

  const sendEnquiryButton = document.getElementById("send-enquiry");
  const clientFields = [
    document.getElementById("client-name"),
    document.getElementById("client-email")
  ];
  let isSendingEnquiry = false;

  function createBriefText() {
    const data = new FormData(assessmentForm);
    const details = briefFields.map(([name, label]) => label + ": " + (data.get(name) || "Not selected"));
    const notes = data.get("projectNotes").trim();
    return "Hello Iltifat,\n\nI’d like to discuss a project. Here is my brief.\n\n"
      + details.join("\n")
      + (notes ? "\n\nAdditional details\n" + notes : "");
  }

  function updateAssessment() {
    const data = new FormData(assessmentForm);
    let completed = 0;
    briefFields.forEach(([name]) => {
      const value = data.get(name);
      document.getElementById("brief-" + name).textContent = value || "Not selected";
      if (value) completed += 1;
    });
    document.getElementById("assessment-progress").value = completed;
    document.getElementById("assessment-progress-text").textContent = completed + " of 5 details selected";
    document.getElementById("assessment-progress-percent").textContent = (completed * 20) + "%";
    const briefText = createBriefText();
    briefEmail.href = "mailto:iltifaatyousuf@gmail.com?subject="
      + encodeURIComponent("Project enquiry — " + (data.get("websiteType") || "New project"))
      + "&body=" + encodeURIComponent(briefText);
    document.getElementById("assessment-whatsapp").href = "https://wa.me/919682648455?text="
      + encodeURIComponent(briefText);
    copyFallback.value = briefText;
    if (!isSendingEnquiry) {
      assessmentStatus.textContent = "";
      sendEnquiryButton.disabled = false;
    }
  }

  assessmentForm.addEventListener("input", updateAssessment);
  assessmentForm.addEventListener("change", updateAssessment);
  assessmentForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (isSendingEnquiry || !assessmentForm.reportValidity()) return;
    if (event.submitter?.value !== "send") {
      updateAssessment();
      briefActions.hidden = false;
      clientFields.forEach(field => { field.disabled = false; });
      assessmentStatus.textContent = "Your brief is ready. Add your name and email to send your enquiry.";
      clientFields[0].focus();
      return;
    }

    const payload = new FormData(assessmentForm);
    payload.delete("intent");
    payload.set("_subject", "Portfolio project enquiry — " + payload.get("websiteType"));
    payload.set("projectBrief", createBriefText());
    const controls = [...assessmentForm.elements].map(control => ({
      element: control,
      wasDisabled: control.disabled
    }));
    isSendingEnquiry = true;
    controls.forEach(control => { control.element.disabled = true; });
    assessmentStatus.textContent = "Sending your enquiry…";
    let wasSent = false;
    const requestController = new AbortController();
    const requestTimeout = window.setTimeout(() => requestController.abort(), 20000);
    try {
      const response = await fetch(assessmentForm.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        signal: requestController.signal,
        body: payload
      });
      if (!response.ok) throw new Error("Enquiry delivery failed");
      wasSent = true;
      assessmentStatus.textContent = "Thank you. Your enquiry has been sent. I’ll reply to the email address you provided.";
    } catch {
      assessmentStatus.textContent = "Your enquiry couldn’t be sent. Your details are still here. Try again, or email your brief.";
    } finally {
      window.clearTimeout(requestTimeout);
      controls.forEach(control => { control.element.disabled = control.wasDisabled; });
      isSendingEnquiry = false;
      sendEnquiryButton.disabled = wasSent;
    }
  });
  clientFields.forEach(field => field.addEventListener("input", updateAssessment));
  document.getElementById("copy-brief").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(createBriefText());
      copyFallback.hidden = true;
      assessmentStatus.textContent = "Project brief copied.";
    } catch {
      copyFallback.value = createBriefText();
      copyFallback.hidden = false;
      copyFallback.focus();
      copyFallback.select();
      assessmentStatus.textContent = "Select and copy your brief from the text box.";
    }
  });
  updateAssessment();

  document.querySelectorAll("[data-case-study]").forEach(button => {
    button.addEventListener("click", () => {
      document.getElementById(button.dataset.caseStudy).showModal();
    });
  });
  document.querySelectorAll(".case-study-dialog").forEach(dialog => {
    dialog.addEventListener("click", event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (
        event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom
      )) {
        dialog.close();
      }
    });
  });


  const directionTabs = [...document.querySelectorAll(".direction-tab")];
  const directionTabList = document.querySelector(".direction-tabs");
  const directionImage = document.getElementById("direction-image");
  const fullDirectionImage = document.getElementById("design-reference-full");
  const designStyleSelect = document.getElementById("designStyle");
  let activeDirectionIndex = 0;

  function showDirection(index) {
    activeDirectionIndex = index;
    const tab = directionTabs[index];
    const direction = tab.dataset;
    directionTabs.forEach((button, buttonIndex) => {
      const isSelected = buttonIndex === index;
      button.setAttribute("aria-selected", String(isSelected));
      button.tabIndex = isSelected ? 0 : -1;
    });
    document.getElementById("direction-panel").setAttribute("aria-labelledby", tab.id);
    document.getElementById("direction-title").textContent = direction.title;
    document.getElementById("direction-browser-title").textContent = direction.title;
    document.getElementById("direction-description").textContent = direction.description;
    directionImage.src = "assets/style-" + direction.slug + ".webp";
    directionImage.alt = direction.title + " website design reference";
    directionImage.width = Number(direction.width);
    directionImage.height = Number(direction.height);
    fullDirectionImage.src = directionImage.src;
    fullDirectionImage.alt = "Full " + direction.title + " website design reference";
    fullDirectionImage.width = directionImage.width;
    fullDirectionImage.height = directionImage.height;
    document.getElementById("design-reference-title").textContent = direction.title;
    document.getElementById("direction-preview").setAttribute("aria-label", "View " + direction.title + " full design");
    const useCases = direction.uses.split("|").map(label => {
      const span = document.createElement("span");
      span.textContent = label;
      return span;
    });
    document.getElementById("direction-use-cases").replaceChildren(...useCases);
    const colors = direction.palette.split("|");
    document.getElementById("direction-stage").style.setProperty("--direction-color-a", colors[0]);
    document.getElementById("direction-stage").style.setProperty("--direction-color-b", colors[1]);
    document.getElementById("direction-swatches").replaceChildren(...colors.map(color => {
      const swatch = document.createElement("i");
      swatch.style.backgroundColor = color;
      return swatch;
    }));
  }

  directionTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => showDirection(index));
    tab.addEventListener("keydown", event => {
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % directionTabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + directionTabs.length) % directionTabs.length;
      else if (event.key === "ArrowDown") nextIndex = (index + 2) % directionTabs.length;
      else if (event.key === "ArrowUp") nextIndex = (index - 2 + directionTabs.length) % directionTabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = directionTabs.length - 1;
      else return;
      event.preventDefault();
      showDirection(nextIndex);
      directionTabs[nextIndex].focus();
    });
  });
  directionTabList.setAttribute("aria-orientation", "horizontal");

  document.getElementById("use-design-direction").addEventListener("click", () => {
    if (!designStyleSelect.disabled) {
      designStyleSelect.value = directionTabs[activeDirectionIndex].dataset.title;
      designStyleSelect.dispatchEvent(new Event("change", { bubbles: true }));
      designStyleSelect.focus({ preventScroll: true });
    }
  });
  designStyleSelect.addEventListener("change", () => {
    const matchingIndex = directionTabs.findIndex(tab => tab.dataset.title === designStyleSelect.value);
    if (matchingIndex !== -1) showDirection(matchingIndex);
  });

  const heroFolders = [...document.querySelectorAll(".hero-folder")];
  const heroArchiveLink = document.getElementById("hero-archive-selected");
  function activateHeroFolder(folder) {
    heroFolders.forEach(item => item.classList.toggle("is-active", item === folder));
    document.getElementById("hero-archive-selected-name").textContent = "View " + folder.dataset.title;
    heroArchiveLink.dataset.heroDirection = folder.dataset.heroDirection;
  }
  heroFolders.forEach(folder => {
    folder.addEventListener("pointerenter", () => activateHeroFolder(folder));
    folder.addEventListener("focus", () => activateHeroFolder(folder));
  });
  document.querySelectorAll("[data-hero-direction]").forEach(link => {
    link.addEventListener("click", () => {
      const index = directionTabs.findIndex(tab => tab.dataset.slug === link.dataset.heroDirection);
      if (index !== -1) {
        showDirection(index);
        directionTabs[index].focus({ preventScroll: true });
      }
    });
  });

  showDirection(0);

})();
