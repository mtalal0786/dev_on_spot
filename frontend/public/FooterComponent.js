class MainFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
<footer class="main-footer">
			<div class="main-footer__shape-1 img-bounce"></div>
			<div class="main-footer__top">
				<div class="container">
					<div class="row">
						<div class="col-xl-3 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay="100ms">
							<div class="footer-widget__column footer-widget__about">
								<div class="footer-widget__logo">
									<a href="index.html"><img src="images/resource/logo-1.png" alt=""></a>
								</div>
								<p class="footer-widget__about-text">A Magical Tool to Optimize Your Code for the
									Future.
									Transform your ideas into functional code instantly—perfect for any project.</p>
							</div>
						</div>
						<div class="col-xl-2 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay="200ms">
							<div class="footer-widget__column footer-widget__company">
								<div class="footer-widget__title-box">
									<h3 class="footer-widget__title">Company</h3>
								</div>
								<div class="footer-widget__company-list-box">
									<ul class="footer-widget__company-list">
										<li><a href="login.html">Sign in</a></li>
										<li><a href="create-account.html">Register</a></li>
										<li><a href="about.html">Pricing</a></li>
										<li><a href="about.html">Privacy Policy</a></li>
										<li><a href="career.html">Career</a></li>
									</ul>
								</div>
							</div>
						</div>
						<div class="col-xl-2 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay="300ms">
							<div class="footer-widget__column footer-widget__resources">
								<div class="footer-widget__title-box">
									<h3 class="footer-widget__title">Resources</h3>
								</div>
								<div class="footer-widget__resources-list-box">
									<ul class="footer-widget__resources-list">
										<li><a href="about.html">AI Plan Generator</a></li>
										<li><a href="about.html">Web App Generator</a></li>
										<li><a href="about.html">AI Code Generator</a></li>
										<li><a href="about.html">AI App Generator</a></li>
										<li><a href="blog.html">No Code Websites Generator</a></li>
									</ul>
								</div>
							</div>
						</div>
						<div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay="400ms">
							<div class="footer-widget__column footer-widget__newsletter">
								<div class="footer-widget__title-box">
									<h3 class="footer-widget__title">Resources</h3>
								</div>
								<div class="footer-widget__email-form">
									<form class="footer-widget__email-box">
										<div class="footer-widget__email-input-box">
											<input type="email" placeholder="Inter Your Email" name="email">
										</div>
										<button type="submit" class="footer-widget__btn"><i
												class="fas fa-paper-plane"></i></button>
									</form>
								</div>
								<div class="site-footer__social">
									<a href="#"><i class="icon-social-1"></i></a>
									<a href="#"><i class="icon-social-2"></i></a>
									<a href="#"><i class="icon-social-3"></i></a>
									<a href="#"><i class="icon-social-4"></i></a>
									<a href="#"><i class="icon-social-5"></i></a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="main-footer__bottom">
				<div class="container">
					<div class="main-footer__bottom-inner">
						<p class="main-footer__bottom-text">Copyright © 2025. All Rights Reserved.</p>
					</div>
				</div>
			</div>
		</footer>
    `;
  }
}
customElements.define('main-footer', MainFooter);
