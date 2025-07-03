class MainHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
<header class="main-header main-header-one">
  <!-- Header Lower -->
  <div class="header-lower">
    <div class="main-menu__wrapper">
      <div class="inner-container d-flex align-items-center justify-content-between">
        <!-- Logo Box -->
        <div class="main-header-one__logo-box">
          <a href="index.html"><img src="images/resource/logo-1.png" alt=""></a>
        </div>
        <div class="nav-outer">
          <!-- Main Menu -->
          <nav class="main-menu show navbar-expand-md">
            <div class="navbar-header">
              <button class="navbar-toggler" type="button" data-toggle="collapse"
                data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                aria-expanded="false" aria-label="Toggle navigation">
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
              </button>
            </div>
            <div class="navbar-collapse collapse clearfix" id="navbarSupportedContent">
              <ul class="navigation clearfix">
                <li><a href="index.html">Home</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="contact.html">Contact</a></li>
              </ul>
            </div>
          </nav>
          <!-- Main Menu End-->
        </div>
        <!-- Outer Box -->
        <div class="outer-box d-flex align-items-center">
          <ul class="main-header__login-sing-up">
            <li><a href="login.html">Login</a></li>
            <li><a href="create-account.html">Sign Up</a></li>
          </ul>
          <!-- Mobile Navigation Toggler -->
          <div class="mobile-nav-toggler">
            <span class="icon-menu"></span>
          </div>
        </div>
        <!-- End Outer Box -->
      </div>
    </div>
  </div>
  <!-- End Header Lower -->
  <!-- Mobile Menu  -->
  <div class="mobile-menu">
    <div class="menu-backdrop"></div>
    <div class="close-btn"><span class="icon far fa-times fa-fw"></span></div>
    <nav class="menu-box">
      <div class="nav-logo"><a href="index.html"><img src="images/resource/logo-1.png" alt="" title=""></a></div>
      <!-- Search -->
      <div class="search-box">
        <form method="post" action="contact.html">
          <div class="form-group">
            <input type="search" name="search-field" value="" placeholder="SEARCH HERE" required>
            <button type="submit"><span class="icon far fa-search fa-fw"></span></button>
          </div>
        </form>
      </div>
      <div class="menu-outer">
        <!--Here Menu Will Come Automatically Via Javascript / Same Menu as in Header-->
      </div>
    </nav>
  </div>
  <!-- End Mobile Menu -->
</header>
    `;
  }
}
customElements.define('main-header', MainHeader);
