import styled from '@emotion/styled';
import type { CSSObject } from '@emotion/styled';

import themeConfig from '@configs/themeConfig';
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses';

type StyledFooterProps = {
  overrideStyles?: CSSObject;
};

const StyledFooter = styled.footer<StyledFooterProps>`
  position: relative;
  background: linear-gradient(145deg, rgb(46, 125, 50) 59.8%, rgb(122, 186, 120) 59.8%);
  color: white;
   width: 70%;  // Set footer width to 80% of the screen
  max-width: 1180px;  // Maximum width for large screens
  margin: 0 auto;  // Center the footer horizontally
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;

  & .${verticalLayoutClasses.footerContentWrapper} {
    padding: 0.5rem 0.5rem;
    max-width: ${themeConfig.compactContentWidth}px;
    margin: 0 auto;
  }

  .footer-bottom {
    background: rgba(0, 0, 0, 0.2);
    padding: 0.5rem 0;
    margin-top: 0.5rem;
  }

  .social-icons {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }

  ${({ overrideStyles }) => overrideStyles}
`;

export default StyledFooter;
