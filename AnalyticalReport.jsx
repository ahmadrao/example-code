import { Container, Row, Col, Spinner } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { nesteObjectKeys } from "#helpers/nesteObjectKeys";
import { actions as reportsActions } from "#reducers/reports.reducer";
import { actions as notificationActions } from "#reducers/notification.reducer";

import AnalyticalReportContext from "#context/AnalyticalReport.context";

import PageHeader from "#common/page/PageHeader.react";
import TagsSelect from "#common/react-bootstrap-form/Tags.select";

import AnalyticalReportMenu from "./AnalyticalReportMenu.react";
import Card from "#common/card/Card.react";
import RolesMulti from "#common/react-bootstrap-form/Roles.multi";
import ReportDetailsCategory from "#common/react-bootstrap-form/ReportDetailsCategory.select";
import OrganizationsMulti from "#common/react-bootstrap-form/Organizations.multi";
import Notification from "#base/notification/Notification.react";
import { useState } from "react";

const AnalyticalReport = () => {
  const { reportID } = useParams();
  const dispatch = useDispatch();

  const [apiID] = useState("update-report");
  const { details: reports } = useSelector((s) => s.reports);

  const [state, setState] = useState({});
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [organizationTouched, setOrganizationTouched] = useState(false);
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { id, name, url, description, type, tags, status } = state;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await dispatch({
        type: reportsActions.getReport,
        payload: { report_id: reportID },
      });
      setIsLoading(false);
    };

    fetchData();
  }, [dispatch, reportID]);

  useEffect(() => {
    setState(reports[reportID] || {});
  }, [reportID, reports]);

  const onFormSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    let formDataObj = Object.fromEntries(formData.entries());

    formDataObj = nesteObjectKeys(formDataObj);

    formDataObj.tags = [formDataObj.tags || ""];
    formDataObj.roles = selectedRoles.map((x) => x.data?.name);
    formDataObj.status = formDataObj.status === "on" ? "ACTIVE" : "INACTIVE";
    if (organizationTouched) {
      formDataObj.assigned_organizations = {
        organization_ids: selectedOrganizations.map((x) => ({
          id: x.data?.id,
        })),
      };
    } else {
      formDataObj.assigned_organizations = {
        organization_ids: state?.assigned_organizations?.organization_ids,
      };
    }

    dispatch({
      type: reportsActions.updateReport,
      payload: {
        formData: {
          ...formDataObj,
          apiID,
          onSuccess: () => {
            dispatch({
              type: notificationActions.addToast,
              payload: {
                message: "Report updated.",
              },
            });
          },
        },
        pathParams: {
          report_id: reportID,
        },
      },
    });
  };

  if (isLoading) {
    return <div className="w-100 vh-100 d-flex align-items-center justify-content-center">
      <Spinner animation="border" role="status" >
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  }
  return (
    <AnalyticalReportContext.Provider value={[state, setState]}>
      <PageHeader
        breadcrumbs={{
          title: "Report Management",
          crumbs: [name || ""],
        }}
        goBack="/analytical-reports"
      />
      <Notification />
      <div className="main__container">
        <Row>
          <AnalyticalReportMenu />

          <Col sm={12} lg={9}>
            <Card>
              <div className="card__body">
                <Container>
                  <Row>
                    <Col lg="2" />

                    <Col lg="8">
                      <Form
                        className="form-1"
                        id="update-report"
                        onSubmit={onFormSubmit}
                      >
                        <h3>Report Info:</h3>

                        <Form.Group className="mb-3 row">
                          <Form.Label className="col-3">Name</Form.Label>
                          <Form.Control
                            className="col-9"
                            name="name"
                            defaultValue={name}
                            required
                          />
                        </Form.Group>

                        <Form.Group className="mb-3 row">
                          <Form.Label className="col-3">Tableau URL</Form.Label>
                          <Form.Control
                            className="col-9"
                            name="url"
                            defaultValue={url}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3 row">
                          <Form.Label className="col-3">Description</Form.Label>
                          <Form.Control
                            className="col-9"
                            name="description"
                            as="textarea"
                            defaultValue={description}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3 row">
                          <Form.Label className="col-3">Category</Form.Label>
                          <ReportDetailsCategory
                            defaultValue={type}
                            name="type"
                          />
                        </Form.Group>

                        <RolesMulti
                          selected={selectedRoles}
                          onChange={(roles) => setSelectedRoles(roles)}
                          index="name"
                          defaultValue={state?.roles}
                        />

                        <OrganizationsMulti
                          selected={selectedOrganizations}
                          onChange={(items) => {
                            setOrganizationTouched(true);
                            setSelectedOrganizations(items);
                          }}
                          defaultValue={
                            state?.assigned_organizations?.organization_ids
                          }
                        />

                        <Form.Group className="mb-3 row">
                          <Form.Label className="col-3">Tag</Form.Label>
                          <TagsSelect
                            defaultValue={tags?.[0]?.name}
                            key={tags?.[0]?.name}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3 row">
                          <Form.Label className="col-3">Status</Form.Label>
                          <div className="col-9" style={{ padding: 0 }}>
                            <Form.Check
                              type="switch"
                              name="status"
                              defaultChecked={status === "ACTIVE"}
                              key={"status-" + id}
                            />
                          </div>
                        </Form.Group>
                      </Form>
                    </Col>

                    <Col lg="2" />
                  </Row>
                </Container>
              </div>

              <div className="card--footer">
                <Container>
                  <Row>
                    <Col lg="2" />

                    <Col lg="8">
                      <div className="mb-3 row">
                        <div className="col-3" />

                        <div className="col-9" style={{ padding: 0 }}>
                          <Button
                            variant="primary"
                            type="submit"
                            form="update-report"
                          >
                            Update
                          </Button>
                        </div>
                      </div>
                    </Col>

                    <Col lg="2" />
                  </Row>
                </Container>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </AnalyticalReportContext.Provider>
  );
};

export default AnalyticalReport;
